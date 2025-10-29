import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import MessageComposer from "../components/MessageComposer";
import ConversationList from "../components/ConversationList";
import NewConversationForm from "../components/NewConversationForm";
import { getConversation, listConversations } from "../api/conversations";
import { sendChatCompletion } from "../api/chat";
import { useAuth } from "../context/AuthContext";
const ChatPage = () => {
    const { conversationId } = useParams();
    const { token, userId, logout } = useAuth();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isSidebarLoading, setIsSidebarLoading] = useState(true);
    const [sidebarError, setSidebarError] = useState(null);
    const [showNewConversation, setShowNewConversation] = useState(false);
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
    const loadConversation = async () => {
        if (!token || !conversationId) {
            return;
        }
        try {
            setIsLoading(true);
            const data = await getConversation(token, conversationId);
            setConversation(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar a conversa.");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        void loadConversation();
        void fetchSidebarConversations();
    }, [conversationId, token]);
    const messages = useMemo(() => conversation?.messages ?? [], [conversation]);
    const handleSend = async (content) => {
        if (!token || !conversation || !conversationId) {
            return;
        }
        setIsSending(true);
        try {
            const payloadMessages = [
                ...messages.map((message) => ({
                    role: message.role,
                    content: message.content
                })),
                { role: "user", content }
            ];
            const response = await sendChatCompletion(token, {
                model: conversation.model,
                mode: conversation.mode,
                conversation_id: conversationId,
                stream: false,
                messages: payloadMessages
            });
            const now = new Date();
            const assistantMessage = response.choices[0]?.message;
            const updatedMessages = [
                ...messages,
                { role: "user", content, timestamp: now.toISOString() }
            ];
            if (assistantMessage) {
                updatedMessages.push({
                    role: assistantMessage.role,
                    content: assistantMessage.content,
                    timestamp: new Date(response.created * 1000).toISOString()
                });
            }
            setConversation((current) => current
                ? {
                    ...current,
                    messages: updatedMessages,
                    updated_at: new Date().toISOString()
                }
                : current);
            setError(null);
            void loadConversation();
            void fetchSidebarConversations();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
        }
        finally {
            setIsSending(false);
        }
    };
    if (!conversationId) {
        return _jsx(NavigateToHome, {});
    }
    const userInitials = (userId ?? "Usuário")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-top", children: [_jsx("span", { className: "sidebar-logo", children: "Nexus AI" }), _jsx("button", { className: "sidebar-new-button", type: "button", onClick: () => setShowNewConversation((current) => !current), children: "+ Nova Conversa" }), showNewConversation ? (_jsx(NewConversationForm, { variant: "sidebar", onCancel: () => setShowNewConversation(false), onCreated: (newConversationId) => {
                                    setShowNewConversation(false);
                                    void fetchSidebarConversations();
                                    navigate(`/conversations/${newConversationId}`);
                                } })) : null] }), _jsxs("div", { className: "sidebar-section", children: [_jsx("span", { className: "sidebar-section-title", children: "\u00DAltimas conversas" }), _jsx(ConversationList, { conversations: conversations, isLoading: isSidebarLoading, error: sidebarError, activeConversationId: conversationId })] }), _jsxs("div", { className: "sidebar-footer", children: [_jsx("div", { className: "sidebar-avatar", children: userInitials || "U" }), _jsxs("div", { className: "sidebar-user", children: [_jsx("strong", { children: userId ?? "Usuário" }), _jsx("span", { children: "Conectado" })] }), _jsx("button", { type: "button", className: "sidebar-logout", onClick: logout, children: "Sair" })] })] }), _jsx("main", { className: "workspace", children: _jsxs("div", { className: "workspace-inner", children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("div", { className: "topbar-brand", children: "Nexus AI" }), _jsx("div", { className: "subtitle", children: conversation
                                                ? `${conversation.title || conversation.conversation_id} · ${conversation.model} (${conversation.mode})`
                                                : "Carregando conversa..." })] }), _jsxs("div", { className: "topbar-actions", children: [_jsxs("span", { className: "topbar-status", children: [_jsx("span", { className: "status-dot" }), " Multi-IA ativo"] }), _jsx(Link, { to: "/", className: "btn btn-secondary", children: "\u2190 Conversas" })] })] }), isLoading ? (_jsx("div", { className: "panel", children: _jsx("p", { className: "text-muted", children: "Carregando conversa..." }) })) : error ? (_jsxs("div", { className: "panel", children: [_jsx("p", { role: "alert", className: "text-muted", children: error }), _jsx("button", { className: "btn btn-secondary", style: { marginTop: "1rem" }, onClick: () => navigate("/"), children: "Voltar" })] })) : conversation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "panel", style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: _jsx("div", { className: "message-list", children: messages.length ? (messages.map((message, index) => (_jsx(ChatMessage, { message: message }, `${message.role}-${index}`)))) : (_jsx("p", { className: "text-muted", children: "Nenhuma mensagem ainda. Envie a primeira!" })) }) }), _jsx(MessageComposer, { onSend: handleSend, isSending: isSending, model: conversation.model, mode: conversation.mode })] })) : (_jsxs("div", { className: "panel", children: [_jsx("p", { className: "text-muted", children: "Conversa n\u00E3o encontrada. Ela pode ter sido removida." }), _jsx("button", { className: "btn btn-secondary", onClick: () => navigate("/"), children: "Voltar" })] }))] }) })] }));
};
const NavigateToHome = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/", { replace: true });
    }, [navigate]);
    return null;
};
export default ChatPage;
