
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import MessageComposer from "../components/MessageComposer";
import ConversationList from "../components/ConversationList";
import NewConversationForm from "../components/NewConversationForm";
import { getConversation, listConversations } from "../api/conversations";
import { sendChatCompletion } from "../api/chat";
import { useAuth } from "../context/AuthContext";
import { getModelCreditCost, getModelDisplayName } from "../utils/credits";
import type { ConversationDetail, ConversationSummary, Message, Usage } from "../types";

type PendingRetry = {
  content: string;
  cost: number;
  placeholderId?: string;
};

const formatCredits = (value: number | null) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { token, userId, username, email, credits, logout, refreshCredits } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);
  const [isSwitchingConversation, setIsSwitchingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingDebit, setPendingDebit] = useState(0);
  const [lastUsage, setLastUsage] = useState<Usage | null>(null);
  const lastUsageCredits = lastUsage?.cost_credits ?? 0;
  const [retryRequest, setRetryRequest] = useState<PendingRetry | null>(null);
  const retryingRef = useRef(false);
  const prevCreditsRef = useRef(credits ?? 0);

  // 🔽 referência para rolagem automática
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedConversationRef = useRef(false);

  // Scrolla automaticamente para o final quando as mensagens mudam
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const fetchSidebarConversations = async () => {
    if (!token) return;
    try {
      setIsSidebarLoading(true);
      const data = await listConversations(token);
      setConversations(data);
      setSidebarError(null);
    } catch (err) {
      setSidebarError(
        err instanceof Error ? err.message : "Não foi possível carregar as conversas."
      );
    } finally {
      setIsSidebarLoading(false);
    }
  };

  const loadConversation = useCallback(async () => {
    if (!token || !conversationId) return;
    setIsLoading(true);
    setError(null);
    if (hasLoadedConversationRef.current) {
      setIsSwitchingConversation(true);
    }
    try {
      const data = await getConversation(token, conversationId);
      setConversation(data);
      setHasLoadedConversation(true);
      hasLoadedConversationRef.current = true;
      setError(null);
    } catch (err) {
      setConversation(null);
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar a conversa."
      );
    } finally {
      setIsLoading(false);
      setIsSwitchingConversation(false);
    }
  }, [conversationId, token]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    void fetchSidebarConversations();
  }, [conversationId, token]);

  useEffect(() => {
    if (!token) return;
    void refreshCredits();
  }, [conversationId, refreshCredits, token]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setPendingDebit(0);
    setRetryRequest(null);
  }, [conversationId]);

  const messages = useMemo(() => conversation?.messages ?? [], [conversation]);
  const composerCost = conversation
    ? getModelCreditCost(conversation.model, conversation.mode)
    : null;
  const realtimeCredits = useMemo(
    () => Math.max((credits ?? 0) - pendingDebit, 0),
    [credits, pendingDebit],
  );

  const handleAssistantSuccess = useCallback(
    ({
      assistantMessage,
      createdAt,
      placeholderId,
      usage,
    }: {
      assistantMessage?: Message;
      createdAt: number;
      placeholderId: string;
      usage?: Usage;
    }) => {
      const assistantContent = assistantMessage?.content?.trim();
      setConversation((current) => {
        if (!current) return current;
        const withoutPlaceholder = current.messages.filter(
          (message) => message.clientId !== placeholderId,
        );
        if (assistantContent) {
          withoutPlaceholder.push({
            role: assistantMessage?.role ?? "assistant",
            content: assistantContent,
            timestamp: new Date(createdAt * 1000).toISOString(),
          });
          setLastUsage(usage ?? null);
        } else {
          withoutPlaceholder.push({
            role: "assistant",
            content:
              "O modelo finalizou sem gerar uma resposta exibível. Tente reformular a pergunta.",
            timestamp: new Date().toISOString(),
            variant: "error",
          });
          setLastUsage(null);
        }
        return {
          ...current,
          messages: withoutPlaceholder,
          updated_at: new Date().toISOString(),
        };
      });
    },
    [],
  );

  const handleSend = useCallback(
    async (content: string): Promise<boolean> => {
      if (!token || !conversation || !conversationId || isSwitchingConversation) {
        return false;
      }
      const trimmed = content.trim();
      if (!trimmed) return false;
      const costPerMessage = getModelCreditCost(conversation.model, conversation.mode);
      const availableCredits = (credits ?? 0) - pendingDebit;
      const guardCredits = Math.max(costPerMessage, lastUsageCredits, 1);
      const baseMessages = conversation.messages ?? [];
      const payloadMessages: Message[] = [
        ...baseMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: trimmed },
      ];

      const now = new Date();
      const optimisticIdSeed = `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
      const userClientId = `user-${optimisticIdSeed}`;
      const assistantPlaceholderId = `assistant-${optimisticIdSeed}`;

    const optimisticUserMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: now.toISOString(),
      clientId: userClientId,
    };

    const pendingAssistantMessage: Message = {
      role: "assistant",
      content: "",
      isLoading: true,
      clientId: assistantPlaceholderId,
    };

    if (availableCredits < guardCredits) {
      setError(
        `Créditos insuficientes para usar ${getModelDisplayName(
          conversation.model,
        )}. Necessários: ${formatCredits(guardCredits)} créditos.`,
      );
      setRetryRequest({
        content: trimmed,
        cost: guardCredits,
      });
      return false;
    }

    setRetryRequest(null);
      setConversation((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, optimisticUserMessage, pendingAssistantMessage],
              updated_at: now.toISOString(),
          }
          : current
      );

      setPendingDebit(guardCredits);
      setIsSending(true);
      try {
        const response = await sendChatCompletion(token, {
          model: conversation.model,
          mode: conversation.mode,
          conversation_id: conversationId,
          stream: false,
          messages: payloadMessages,
        });

        handleAssistantSuccess({
          assistantMessage: response.choices[0]?.message,
          createdAt: response.created,
          placeholderId: assistantPlaceholderId,
          usage: response.usage,
        });
        setError(null);
        void refreshCredits();
        void loadConversation();
        void fetchSidebarConversations();
      } catch (err) {
        const fallbackMessage =
          err instanceof Error ? err.message : "Não foi possível enviar a mensagem.";
        const insufficient = /saldo insuficiente/i.test(fallbackMessage);
        setConversation((current) =>
          current
            ? {
                ...current,
                messages: current.messages.map((message) =>
                  message.clientId === assistantPlaceholderId
                    ? {
                        ...message,
                        isLoading: false,
                        variant: "error",
                        content: insufficient
                          ? "Saldo insuficiente para concluir a resposta. Recarregue e retomaremos automaticamente."
                          : `Não foi possível gerar uma resposta agora. ${fallbackMessage}`,
                      }
                    : message
                ),
              }
            : current
        );
        setError(fallbackMessage);
        setLastUsage(null);
        if (insufficient) {
          setRetryRequest({
            content: trimmed,
            cost: guardCredits,
            placeholderId: assistantPlaceholderId,
          });
        }
      } finally {
        setIsSending(false);
        setPendingDebit(0);
      }
      return true;
    },
    [
      conversation,
      conversationId,
      credits,
      fetchSidebarConversations,
      handleAssistantSuccess,
      isSwitchingConversation,
      lastUsageCredits,
      loadConversation,
      pendingDebit,
      refreshCredits,
      token,
    ]
  );

  const retryPendingResponse = useCallback(
    async (request: PendingRetry) => {
      if (!request.placeholderId) {
        setRetryRequest(null);
        await handleSend(request.content);
        return;
      }
      if (!token || !conversation || !conversationId) return;
      const baseMessages = (conversation.messages ?? []).filter(
        (message) => message.clientId !== request.placeholderId
      );
      if (!baseMessages.length) {
        setRetryRequest(null);
        return;
      }
      setIsSending(true);
      setPendingDebit(request.cost);
      setConversation((current) =>
        current
          ? {
              ...current,
              messages: current.messages.map((message) =>
                message.clientId === request.placeholderId
                  ? {
                      ...message,
                      isLoading: true,
                      variant: undefined,
                      content: "",
                    }
                  : message
              ),
            }
          : current
      );
      try {
        const payloadMessages = baseMessages.map((message) => ({
          role: message.role,
          content: message.content,
        }));
        const response = await sendChatCompletion(token, {
          model: conversation.model,
          mode: conversation.mode,
          conversation_id: conversationId,
          stream: false,
          messages: payloadMessages,
        });
        handleAssistantSuccess({
          assistantMessage: response.choices[0]?.message,
          createdAt: response.created,
          placeholderId: request.placeholderId,
          usage: response.usage,
        });
        setRetryRequest(null);
        setError(null);
        void refreshCredits();
        void loadConversation();
        void fetchSidebarConversations();
      } catch (err) {
        const fallbackMessage =
          err instanceof Error ? err.message : "Não foi possível enviar a mensagem.";
        const insufficient = /saldo insuficiente/i.test(fallbackMessage);
        setConversation((current) =>
          current
            ? {
                ...current,
                messages: current.messages.map((message) =>
                  message.clientId === request.placeholderId
                    ? {
                        ...message,
                        isLoading: false,
                        variant: "error",
                        content: insufficient
                          ? "Saldo insuficiente para continuar. Recarregue para retomar automaticamente."
                          : `Não foi possível gerar resposta. ${fallbackMessage}`,
                      }
                    : message
                ),
              }
            : current
        );
        setError(fallbackMessage);
        if (!insufficient) {
          setRetryRequest(null);
        }
      } finally {
        setPendingDebit(0);
        setIsSending(false);
      }
    },
    [
      conversation,
      conversationId,
      fetchSidebarConversations,
      handleSend,
      handleAssistantSuccess,
      loadConversation,
      refreshCredits,
      token,
    ],
  );

  useEffect(() => {
    const currentCredits = credits ?? 0;
    const previousCredits = prevCreditsRef.current;
    prevCreditsRef.current = currentCredits;
    if (!retryRequest || retryingRef.current) return;
    if (currentCredits >= retryRequest.cost && currentCredits > previousCredits) {
      retryingRef.current = true;
      const request = retryRequest;
      const promise = request.placeholderId
        ? retryPendingResponse(request)
        : (async () => {
            setRetryRequest(null);
            await handleSend(request.content);
          })();
      void promise.finally(() => {
        retryingRef.current = false;
      });
    }
  }, [credits, handleSend, retryPendingResponse, retryRequest]);

  if (!conversationId) return <NavigateToHome />;

  const displayName = username ?? email ?? userId ?? "Usuário";
  const userInitials = displayName
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className={`app-shell ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar-close"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu"
        >
          ×
        </button>
        <div className="sidebar-top">
          <span className="sidebar-logo">Nexus AI</span>
          <button
            className="sidebar-new-button"
            type="button"
            onClick={() => setShowNewConversation((c) => !c)}
          >
            + Nova Conversa
          </button>
          {showNewConversation && (
            <NewConversationForm
              variant="sidebar"
              onCancel={() => setShowNewConversation(false)}
              onCreated={(newConversationId) => {
                setShowNewConversation(false);
                void fetchSidebarConversations();
                setIsSidebarOpen(false);
                navigate(`/conversations/${newConversationId}`);
              }}
            />
          )}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-title">Últimas conversas</span>
          <ConversationList
            conversations={conversations}
            isLoading={isSidebarLoading}
            error={sidebarError}
            activeConversationId={conversationId}
            onSelect={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-profile-info">
            <div className="sidebar-avatar">{userInitials || "U"}</div>
            <div className="sidebar-user">
              <strong>{displayName}</strong>
              <span>{email ?? "Conectado"}</span>
            </div>
          </div>
          <div className="sidebar-user-actions">
            <button type="button" className="sidebar-logout" onClick={logout}>
              Sair
            </button>
            <button
              type="button"
              className="sidebar-profile-button"
              onClick={() => navigate("/perfil")}
            >
              Assinatura
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Ocultar menu de conversas"
        />
      ) : null}

      <main className="workspace">
        <div className="workspace-inner">
          <header className="topbar">
            <div>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(true)}
              >
                Conversas
              </button>
              <div className="topbar-brand">Nexus AI</div>
              <div className="subtitle">
                {conversation
                  ? `${conversation.title || conversation.conversation_id} · ${
                      conversation.model
                    } (${conversation.mode})`
                  : "Carregando conversa..."}
              </div>
            </div>
            <div className="topbar-actions">
              <div className="credits-pill">
                <span>Saldo em tempo real</span>
                <strong>{formatCredits(realtimeCredits)} créditos</strong>
                {pendingDebit > 0 ? (
                  <span className="credits-pill-sub">
                    -{formatCredits(pendingDebit)} em processamento
                  </span>
                ) : null}
              </div>
              <span className="topbar-status">
                <span className="status-dot" /> Multi-IA ativo
              </span>
              <Link to="/" className="btn btn-secondary">
                ← Conversas
              </Link>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL */}
          {!hasLoadedConversation && isLoading ? (
            <div className="panel">
              <div className="loading-indicator">
                <span className="spinner" aria-hidden="true" />
                <span>Carregando conversa...</span>
              </div>
            </div>
          ) : error ? (
            <div className="panel">
              <p role="alert" className="text-muted">
                {error}
              </p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: "1rem" }}
                onClick={() => navigate("/")}
              >
                Voltar
              </button>
            </div>
          ) : conversation ? (
            <div
              className={`chat-content${
                isSwitchingConversation ? " chat-content-switching" : ""
              }`}
            >
              <div
                className="panel panel-scroll"
                style={{
                  maxHeight: "calc(100vh - 140px)",
                  overflowY: "auto",
                  paddingBottom: "0.5rem",
                  scrollBehavior: "smooth",
                }}
              >
                <div className="message-list" style={{ paddingBottom: "0.5rem" }}>
                  {messages.length ? (
                    messages.map((message, index) => {
                      const messageKey =
                        message.clientId ??
                        (message.timestamp
                          ? `${message.role}-${message.timestamp}`
                          : `${message.role}-${index}`);
                      return <ChatMessage key={messageKey} message={message} />;
                    })
                  ) : (
                    <p className="text-muted">
                      Nenhuma mensagem ainda. Envie a primeira!
                    </p>
                  )}
                  {/* 🔽 âncora de rolagem */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <MessageComposer
                onSend={handleSend}
                isSending={isSending}
                isBusy={isSwitchingConversation}
                busyLabel="Carregando..."
                creditCost={composerCost ?? undefined}
                model={conversation.model}
                mode={conversation.mode}
                availableCredits={realtimeCredits}
                pendingDebit={pendingDebit}
                lastUsage={lastUsage ?? undefined}
              />
              {isSwitchingConversation ? (
                <div className="chat-loading-overlay" aria-live="polite">
                  <span className="spinner" aria-hidden="true" />
                  <span>Trocando de conversa...</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="panel">
              <p className="text-muted">
                Conversa não encontrada. Ela pode ter sido removida.
              </p>
              <button className="btn btn-secondary" onClick={() => navigate("/")}>
                Voltar
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavigateToHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
};

export default ChatPage;
