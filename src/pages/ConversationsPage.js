import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationList from "../components/ConversationList";
import NewConversationForm from "../components/NewConversationForm";
import { listConversations } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
const quickActions = [
    {
        icon: "📊",
        title: "Análise de Dados",
        description: "Análise e visualização com IA especializada"
    },
    {
        icon: "💻",
        title: "Geração de Código",
        description: "Código otimizado com IA de programação"
    },
    {
        icon: "🎨",
        title: "Geração de Imagens",
        description: "Imagens criativas com IA visual"
    },
    {
        icon: "📚",
        title: "Conhecimento Geral",
        description: "Respostas precisas com IA generalista"
    }
];
const ConversationsPage = () => {
    const { token, userId, logout } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const fetchConversations = async () => {
        if (!token)
            return;
        try {
            setIsLoading(true);
            const data = await listConversations(token);
            setConversations(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Não foi possível carregar as conversas.");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        void fetchConversations();
    }, [token]);
    const userInitials = (userId ?? "Usuário")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-top", children: [_jsx("span", { className: "sidebar-logo", children: "Nexus AI" }), _jsx("button", { className: "sidebar-new-button", type: "button", onClick: () => setShowNewConversation((current) => !current), children: "+ Nova Conversa" }), showNewConversation ? (_jsx(NewConversationForm, { variant: "sidebar", onCancel: () => setShowNewConversation(false), onCreated: (conversationId) => {
                                    setShowNewConversation(false);
                                    void fetchConversations();
                                    navigate(`/conversations/${conversationId}`);
                                } })) : null] }), _jsxs("div", { className: "sidebar-section", children: [_jsx("span", { className: "sidebar-section-title", children: "\u00DAltimas conversas" }), _jsx(ConversationList, { conversations: conversations, isLoading: isLoading, error: error })] }), _jsxs("div", { className: "sidebar-footer", children: [_jsx("div", { className: "sidebar-avatar", children: userInitials || "U" }), _jsxs("div", { className: "sidebar-user", children: [_jsx("strong", { children: userId ?? "Usuário" }), _jsx("span", { children: "Conectado" })] }), _jsx("button", { type: "button", className: "sidebar-logout", onClick: logout, children: "Sair" })] })] }), _jsx("main", { className: "workspace", children: _jsxs("div", { className: "workspace-inner", children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("div", { className: "topbar-brand", children: "Nexus AI" }), _jsx("div", { className: "subtitle", children: "Escolha uma conversa ou comece um novo fluxo com m\u00FAltiplas IAs." })] }), _jsxs("div", { className: "topbar-actions", children: [_jsxs("span", { className: "topbar-status", children: [_jsx("span", { className: "status-dot" }), " Multi-IA ativo"] }), _jsx("button", { className: "btn btn-secondary", onClick: fetchConversations, children: "Atualizar" })] })] }), _jsxs("section", { className: "hero-panel", children: [_jsx("div", { className: "hero-icon", "aria-hidden": "true", children: "\uD83E\uDD16" }), _jsxs("div", { children: [_jsx("h1", { className: "hero-title", children: "Nexus AI" }), _jsx("p", { className: "hero-description", children: "Sistema inteligente que integra m\u00FAltiplas IAs especializadas, selecionando automaticamente a melhor IA para cada tipo de tarefa. Pergunte qualquer coisa e deixe o sistema escolher o modelo mais adequado." })] }), _jsx("div", { className: "quick-actions", children: quickActions.map((action) => (_jsxs("div", { className: "quick-card", children: [_jsx("span", { style: { fontSize: "1.3rem" }, children: action.icon }), _jsx("span", { className: "quick-card-title", children: action.title }), _jsx("span", { className: "quick-card-sub", children: action.description })] }, action.title))) })] })] }) })] }));
};
export default ConversationsPage;
