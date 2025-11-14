import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const ConversationList = ({ conversations, isLoading, error, activeConversationId, onSelect, }) => {
    if (isLoading) {
        return (_jsx("div", { className: "conversation-skeleton", "aria-live": "polite", "aria-busy": "true", children: Array.from({ length: 4 }).map((_, index) => (_jsxs("div", { className: "conversation-skeleton-card", children: [_jsx("div", { className: "conversation-skeleton-line" }), _jsx("div", { className: "conversation-skeleton-line short" }), _jsxs("div", { className: "conversation-skeleton-meta", children: [_jsx("span", { className: "conversation-skeleton-line xshort" }), _jsx("span", { className: "conversation-skeleton-line xshort" })] })] }, index))) }));
    }
    if (error) {
        return (_jsx("p", { style: { ...styles.muted, color: "#f87171" }, role: "alert", children: error }));
    }
    if (!conversations.length) {
        return (_jsx("p", { style: styles.muted, children: "Nenhuma conversa encontrada. Crie uma nova para come\u00E7ar." }));
    }
    return (_jsx("div", { style: styles.listContainer, children: conversations.map((conversation) => {
            const updatedAt = new Date(conversation.updated_at).toLocaleString("pt-BR");
            const isActive = conversation.conversation_id === activeConversationId;
            return (_jsxs(Link, { to: `/conversations/${conversation.conversation_id}`, style: {
                    ...styles.link,
                    ...(isActive ? styles.activeLink : {}),
                }, onClick: onSelect, children: [_jsxs("div", { style: styles.linkHeader, children: [_jsx("span", { style: styles.title, children: conversation.title || conversation.conversation_id }), _jsx("span", { style: {
                                    ...styles.badge,
                                    backgroundColor: isActive ? "#3b82f6" : "#334155",
                                }, children: conversation.model })] }), _jsxs("span", { style: styles.subtitle, children: ["modo ", conversation.mode] }), _jsxs("div", { style: styles.meta, children: [_jsxs("span", { children: ["mensagens \u00B7 ", conversation.message_count] }), _jsx("span", { children: updatedAt })] })] }, conversation.conversation_id));
        }) }));
};
export default ConversationList;
//
// 🎨 Inline styles – consistentes com o restante do sistema Nexus
//
const styles = {
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginTop: "0.5rem",
    },
    link: {
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        background: "rgba(30,41,59,0.8)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        color: "#f1f5f9",
        transition: "background 0.2s ease, border 0.2s ease, transform 0.1s ease",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
    activeLink: {
        background: "rgba(59,130,246,0.15)",
        border: "1px solid rgba(59,130,246,0.4)",
        transform: "scale(1.01)",
    },
    linkHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.25rem",
    },
    title: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "180px",
    },
    badge: {
        fontSize: "0.7rem",
        color: "white",
        padding: "0.15rem 0.5rem",
        borderRadius: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    subtitle: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        marginBottom: "0.35rem",
    },
    meta: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.75rem",
        color: "#64748b",
    },
    muted: {
        color: "#94a3b8",
        fontSize: "0.9rem",
        padding: "0.5rem",
    },
};
