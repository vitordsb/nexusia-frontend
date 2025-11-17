import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const formatCredits = (value) => new Intl.NumberFormat("pt-BR").format(value ?? 0);
const ChatPage = () => {
    const { conversationId } = useParams();
    const { token, userId, username, email, credits, logout, refreshCredits } = useAuth();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedConversation, setHasLoadedConversation] = useState(false);
    const [isSwitchingConversation, setIsSwitchingConversation] = useState(false);
    const [error, setError] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isSidebarLoading, setIsSidebarLoading] = useState(true);
    const [sidebarError, setSidebarError] = useState(null);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingDebit, setPendingDebit] = useState(0);
    const [lastUsage, setLastUsage] = useState(null);
    const lastUsageCredits = lastUsage?.cost_credits ?? 0;
    const [retryRequest, setRetryRequest] = useState(null);
    const retryingRef = useRef(false);
    const prevCreditsRef = useRef(credits ?? 0);
    // 🔽 referência para rolagem automática
    const messagesEndRef = useRef(null);
    const hasLoadedConversationRef = useRef(false);
    // Scrolla automaticamente para o final quando as mensagens mudam
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation?.messages]);
    const fetchSidebarConversations = async () => {
        if (!token)
            return;
        try {
            setIsSidebarLoading(true);
            const data = await listConversations(token);
            setConversations(data);
            setSidebarError(null);
        }
        catch (err) {
            setSidebarError(err instanceof Error ? err.message : "Não foi possível carregar as conversas.");
        }
        finally {
            setIsSidebarLoading(false);
        }
    };
    const loadConversation = useCallback(async () => {
        if (!token || !conversationId)
            return;
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
        }
        catch (err) {
            setConversation(null);
            setError(err instanceof Error ? err.message : "Não foi possível carregar a conversa.");
        }
        finally {
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
        if (!token)
            return;
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
    const realtimeCredits = useMemo(() => Math.max((credits ?? 0) - pendingDebit, 0), [credits, pendingDebit]);
    const handleAssistantSuccess = useCallback(({ assistantMessage, createdAt, placeholderId, usage, }) => {
        const assistantContent = assistantMessage?.content?.trim();
        setConversation((current) => {
            if (!current)
                return current;
            const withoutPlaceholder = current.messages.filter((message) => message.clientId !== placeholderId);
            if (assistantContent) {
                withoutPlaceholder.push({
                    role: assistantMessage?.role ?? "assistant",
                    content: assistantContent,
                    timestamp: new Date(createdAt * 1000).toISOString(),
                });
                setLastUsage(usage ?? null);
            }
            else {
                withoutPlaceholder.push({
                    role: "assistant",
                    content: "O modelo finalizou sem gerar uma resposta exibível. Tente reformular a pergunta.",
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
    }, []);
    const handleSend = useCallback(async (content) => {
        if (!token || !conversation || !conversationId || isSwitchingConversation) {
            return false;
        }
        const trimmed = content.trim();
        if (!trimmed)
            return false;
        const costPerMessage = getModelCreditCost(conversation.model, conversation.mode);
        const availableCredits = (credits ?? 0) - pendingDebit;
        const guardCredits = Math.max(costPerMessage, lastUsageCredits, 1);
        const baseMessages = conversation.messages ?? [];
        const payloadMessages = [
            ...baseMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
        ];
        const now = new Date();
        const optimisticIdSeed = `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
        const userClientId = `user-${optimisticIdSeed}`;
        const assistantPlaceholderId = `assistant-${optimisticIdSeed}`;
        const optimisticUserMessage = {
            role: "user",
            content: trimmed,
            timestamp: now.toISOString(),
            clientId: userClientId,
        };
        const pendingAssistantMessage = {
            role: "assistant",
            content: "",
            isLoading: true,
            clientId: assistantPlaceholderId,
        };
        if (availableCredits < guardCredits) {
            setError(`Créditos insuficientes para usar ${getModelDisplayName(conversation.model)}. Necessários: ${formatCredits(guardCredits)} créditos.`);
            setRetryRequest({
                content: trimmed,
                cost: guardCredits,
            });
            return false;
        }
        setRetryRequest(null);
        setConversation((current) => current
            ? {
                ...current,
                messages: [...current.messages, optimisticUserMessage, pendingAssistantMessage],
                updated_at: now.toISOString(),
            }
            : current);
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
        }
        catch (err) {
            const fallbackMessage = err instanceof Error ? err.message : "Não foi possível enviar a mensagem.";
            const insufficient = /saldo insuficiente/i.test(fallbackMessage);
            setConversation((current) => current
                ? {
                    ...current,
                    messages: current.messages.map((message) => message.clientId === assistantPlaceholderId
                        ? {
                            ...message,
                            isLoading: false,
                            variant: "error",
                            content: insufficient
                                ? "Saldo insuficiente para concluir a resposta. Recarregue e retomaremos automaticamente."
                                : `Não foi possível gerar uma resposta agora. ${fallbackMessage}`,
                        }
                        : message),
                }
                : current);
            setError(fallbackMessage);
            setLastUsage(null);
            if (insufficient) {
                setRetryRequest({
                    content: trimmed,
                    cost: guardCredits,
                    placeholderId: assistantPlaceholderId,
                });
            }
        }
        finally {
            setIsSending(false);
            setPendingDebit(0);
        }
        return true;
    }, [
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
    ]);
    const retryPendingResponse = useCallback(async (request) => {
        if (!request.placeholderId) {
            setRetryRequest(null);
            await handleSend(request.content);
            return;
        }
        if (!token || !conversation || !conversationId)
            return;
        const baseMessages = (conversation.messages ?? []).filter((message) => message.clientId !== request.placeholderId);
        if (!baseMessages.length) {
            setRetryRequest(null);
            return;
        }
        setIsSending(true);
        setPendingDebit(request.cost);
        setConversation((current) => current
            ? {
                ...current,
                messages: current.messages.map((message) => message.clientId === request.placeholderId
                    ? {
                        ...message,
                        isLoading: true,
                        variant: undefined,
                        content: "",
                    }
                    : message),
            }
            : current);
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
        }
        catch (err) {
            const fallbackMessage = err instanceof Error ? err.message : "Não foi possível enviar a mensagem.";
            const insufficient = /saldo insuficiente/i.test(fallbackMessage);
            setConversation((current) => current
                ? {
                    ...current,
                    messages: current.messages.map((message) => message.clientId === request.placeholderId
                        ? {
                            ...message,
                            isLoading: false,
                            variant: "error",
                            content: insufficient
                                ? "Saldo insuficiente para continuar. Recarregue para retomar automaticamente."
                                : `Não foi possível gerar resposta. ${fallbackMessage}`,
                        }
                        : message),
                }
                : current);
            setError(fallbackMessage);
            if (!insufficient) {
                setRetryRequest(null);
            }
        }
        finally {
            setPendingDebit(0);
            setIsSending(false);
        }
    }, [
        conversation,
        conversationId,
        fetchSidebarConversations,
        handleSend,
        handleAssistantSuccess,
        loadConversation,
        refreshCredits,
        token,
    ]);
    useEffect(() => {
        const currentCredits = credits ?? 0;
        const previousCredits = prevCreditsRef.current;
        prevCreditsRef.current = currentCredits;
        if (!retryRequest || retryingRef.current)
            return;
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
    if (!conversationId)
        return _jsx(NavigateToHome, {});
    const displayName = username ?? email ?? userId ?? "Usuário";
    const userInitials = displayName
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    return (_jsxs("div", { className: `app-shell ${isSidebarOpen ? "sidebar-open" : ""}`, children: [_jsxs("aside", { className: "sidebar", children: [_jsx("button", { type: "button", className: "sidebar-close", onClick: () => setIsSidebarOpen(false), "aria-label": "Fechar menu", children: "\u00D7" }), _jsxs("div", { className: "sidebar-top", children: [_jsx("span", { className: "sidebar-logo", children: "Nexus AI" }), _jsx("button", { className: "sidebar-new-button", type: "button", onClick: () => setShowNewConversation((c) => !c), children: "+ Nova Conversa" }), showNewConversation && (_jsx(NewConversationForm, { variant: "sidebar", onCancel: () => setShowNewConversation(false), onCreated: (newConversationId) => {
                                    setShowNewConversation(false);
                                    void fetchSidebarConversations();
                                    setIsSidebarOpen(false);
                                    navigate(`/conversations/${newConversationId}`);
                                } }))] }), _jsxs("div", { className: "sidebar-section", children: [_jsx("span", { className: "sidebar-section-title", children: "\u00DAltimas conversas" }), _jsx(ConversationList, { conversations: conversations, isLoading: isSidebarLoading, error: sidebarError, activeConversationId: conversationId, onSelect: () => setIsSidebarOpen(false) })] }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { className: "sidebar-profile-info", children: [_jsx("div", { className: "sidebar-avatar", children: userInitials || "U" }), _jsxs("div", { className: "sidebar-user", children: [_jsx("strong", { children: displayName }), _jsx("span", { children: email ?? "Conectado" })] })] }), _jsxs("div", { className: "sidebar-user-actions", children: [_jsx("button", { type: "button", className: "sidebar-logout", onClick: logout, children: "Sair" }), _jsx("button", { type: "button", className: "sidebar-profile-button", onClick: () => navigate("/perfil"), children: "Assinatura" })] })] })] }), isSidebarOpen ? (_jsx("button", { type: "button", className: "sidebar-backdrop", onClick: () => setIsSidebarOpen(false), "aria-label": "Ocultar menu de conversas" })) : null, _jsx("main", { className: "workspace", children: _jsxs("div", { className: "workspace-inner", children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("button", { type: "button", className: "sidebar-toggle", onClick: () => setIsSidebarOpen(true), children: "Conversas" }), _jsx("div", { className: "topbar-brand", children: "Nexus AI" }), _jsx("div", { className: "subtitle", children: conversation
                                                ? `${conversation.title || conversation.conversation_id} · ${conversation.model} (${conversation.mode})`
                                                : "Carregando conversa..." })] }), _jsxs("div", { className: "topbar-actions", children: [_jsxs("div", { className: "credits-pill", children: [_jsx("span", { children: "Saldo em tempo real" }), _jsxs("strong", { children: [formatCredits(realtimeCredits), " cr\u00E9ditos"] }), pendingDebit > 0 ? (_jsxs("span", { className: "credits-pill-sub", children: ["-", formatCredits(pendingDebit), " em processamento"] })) : null] }), _jsxs("span", { className: "topbar-status", children: [_jsx("span", { className: "status-dot" }), " Multi-IA ativo"] }), _jsx(Link, { to: "/", className: "btn btn-secondary", children: "\u2190 Conversas" })] })] }), !hasLoadedConversation && isLoading ? (_jsx("div", { className: "panel", children: _jsxs("div", { className: "loading-indicator", children: [_jsx("span", { className: "spinner", "aria-hidden": "true" }), _jsx("span", { children: "Carregando conversa..." })] }) })) : error ? (_jsxs("div", { className: "panel", children: [_jsx("p", { role: "alert", className: "text-muted", children: error }), _jsx("button", { className: "btn btn-secondary", style: { marginTop: "1rem" }, onClick: () => navigate("/"), children: "Voltar" })] })) : conversation ? (_jsxs("div", { className: `chat-content${isSwitchingConversation ? " chat-content-switching" : ""}`, children: [_jsx("div", { className: "panel panel-scroll", style: {
                                        maxHeight: "calc(100vh - 140px)",
                                        overflowY: "auto",
                                        paddingBottom: "0.5rem",
                                        scrollBehavior: "smooth",
                                    }, children: _jsxs("div", { className: "message-list", style: { paddingBottom: "0.5rem" }, children: [messages.length ? (messages.map((message, index) => {
                                                const messageKey = message.clientId ??
                                                    (message.timestamp
                                                        ? `${message.role}-${message.timestamp}`
                                                        : `${message.role}-${index}`);
                                                return _jsx(ChatMessage, { message: message }, messageKey);
                                            })) : (_jsx("p", { className: "text-muted", children: "Nenhuma mensagem ainda. Envie a primeira!" })), _jsx("div", { ref: messagesEndRef })] }) }), _jsx(MessageComposer, { onSend: handleSend, isSending: isSending, isBusy: isSwitchingConversation, busyLabel: "Carregando...", creditCost: composerCost ?? undefined, model: conversation.model, mode: conversation.mode, availableCredits: realtimeCredits, pendingDebit: pendingDebit, lastUsage: lastUsage ?? undefined }), isSwitchingConversation ? (_jsxs("div", { className: "chat-loading-overlay", "aria-live": "polite", children: [_jsx("span", { className: "spinner", "aria-hidden": "true" }), _jsx("span", { children: "Trocando de conversa..." })] })) : null] })) : (_jsxs("div", { className: "panel", children: [_jsx("p", { className: "text-muted", children: "Conversa n\u00E3o encontrada. Ela pode ter sido removida." }), _jsx("button", { className: "btn btn-secondary", onClick: () => navigate("/"), children: "Voltar" })] }))] }) })] }));
};
const NavigateToHome = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/", { replace: true });
    }, [navigate]);
    return null;
};
export default ChatPage;
