import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const ConversationList = ({ conversations, isLoading, error, activeConversationId }) => {
    if (isLoading) {
        return _jsx("p", { className: "text-muted", children: "Carregando conversas..." });
    }
    if (error) {
        return (_jsx("p", { className: "text-muted", role: "alert", children: error }));
    }
    if (!conversations.length) {
        return (_jsx("p", { className: "text-muted", children: "Nenhuma conversa encontrada. Crie uma nova para come\u00E7ar." }));
    }
    return (_jsx("div", { className: "sidebar-list", children: conversations.map((conversation) => {
            const updatedAt = new Date(conversation.updated_at).toLocaleString("pt-BR");
            return (_jsxs(Link, { to: `/conversations/${conversation.conversation_id}`, className: `sidebar-link${conversation.conversation_id === activeConversationId ? " is-active" : ""}`, children: [_jsx("span", { className: "sidebar-link-title", children: conversation.title || conversation.conversation_id }), _jsxs("span", { className: "text-muted", children: [conversation.model, " \u00B7 modo ", conversation.mode] }), conversation.last_message_preview ? (_jsx("span", { className: "text-muted", style: { fontSize: "0.8rem" }, children: conversation.last_message_preview })) : null, _jsxs("div", { className: "sidebar-link-meta", children: [_jsxs("span", { children: ["mensagens \u00B7 ", conversation.message_count] }), _jsx("span", { children: updatedAt })] })] }, conversation.conversation_id));
        }) }));
};
export default ConversationList;
