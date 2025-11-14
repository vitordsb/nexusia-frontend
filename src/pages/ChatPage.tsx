
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
import type { ConversationDetail, ConversationSummary, Message } from "../types";

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
    setIsSidebarOpen(false);
  }, [conversationId]);

  const messages = useMemo(() => conversation?.messages ?? [], [conversation]);
  const composerCost = conversation ? getModelCreditCost(conversation.model) : null;

  const handleSend = async (content: string) => {
    if (!token || !conversation || !conversationId || isSwitchingConversation) return;
    const costPerMessage = getModelCreditCost(conversation.model);
    const availableCredits = credits ?? 0;
    if (availableCredits < costPerMessage) {
      setError(
        `Créditos insuficientes para usar ${getModelDisplayName(
          conversation.model,
        )}. Necessários: ${formatCredits(costPerMessage)} créditos. Recarregue na página de Perfil.`,
      );
      return;
    }
    setIsSending(true);
    try {
      const payloadMessages: Message[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      const response = await sendChatCompletion(token, {
        model: conversation.model,
        mode: conversation.mode,
        conversation_id: conversationId,
        stream: false,
        messages: payloadMessages,
      });

      const now = new Date();
      const assistantMessage = response.choices[0]?.message;

      const updatedMessages: Message[] = [
        ...messages,
        { role: "user", content, timestamp: now.toISOString() },
      ];

      if (assistantMessage) {
        updatedMessages.push({
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: new Date(response.created * 1000).toISOString(),
        });
      }

      setConversation((current) =>
        current
          ? {
              ...current,
              messages: updatedMessages,
              updated_at: new Date().toISOString(),
            }
          : current
      );
      setError(null);
      void refreshCredits();
      void loadConversation();
      void fetchSidebarConversations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a mensagem."
      );
    } finally {
      setIsSending(false);
    }
  };

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
          <div className="sidebar-avatar">{userInitials || "U"}</div>
          <div className="sidebar-user">
            <strong>{displayName}</strong>
            <span>{email ?? "Conectado"}</span>
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>
            Sair
          </button>
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
                <span>Saldo</span>
                <strong>{formatCredits(credits)} créditos</strong>
              </div>
              <span className="topbar-status">
                <span className="status-dot" /> Multi-IA ativo
              </span>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate("/assinaturas")}
              >
                Assinaturas
              </button>
              <Link to="/perfil" className="btn btn-outline">
                Perfil
              </Link>
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
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto",
                  paddingBottom: "0.5rem",
                  scrollBehavior: "smooth",
                }}
              >
                <div className="message-list" style={{ paddingBottom: "0.5rem" }}>
                  {messages.length ? (
                    messages.map((message, index) => (
                      <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))
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
