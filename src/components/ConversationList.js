import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
const ConversationList = ({ conversations, isLoading, error, activeConversationId, onSelect, }) => {
    const scrollRef = useRef(null);
    const [scrollState, setScrollState] = useState({
        showTopOverlay: false,
        showBottomOverlay: false,
    });
    useEffect(() => {
        const container = scrollRef.current;
        if (!container)
            return;
        const updateOverlay = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const maxScrollTop = scrollHeight - clientHeight;
            const nextState = {
                showTopOverlay: scrollTop > 8,
                showBottomOverlay: maxScrollTop > 4 && scrollTop < maxScrollTop - 4,
            };
            setScrollState((current) => current.showTopOverlay === nextState.showTopOverlay &&
                current.showBottomOverlay === nextState.showBottomOverlay
                ? current
                : nextState);
        };
        updateOverlay();
        container.addEventListener("scroll", updateOverlay);
        return () => container.removeEventListener("scroll", updateOverlay);
    }, [conversations, isLoading, error]);
    const renderContent = () => {
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
    return (_jsxs("div", { className: "sidebar-list-wrapper", children: [_jsx("div", { className: "sidebar-list-viewport", ref: scrollRef, children: renderContent() }), _jsx("div", { className: `sidebar-list-fade sidebar-list-fade-top${scrollState.showTopOverlay ? " is-visible" : ""}`, "aria-hidden": "true" }), _jsx("div", { className: `sidebar-list-fade sidebar-list-fade-bottom${scrollState.showBottomOverlay ? " is-visible" : ""}`, "aria-hidden": "true" })] }));
};
export default ConversationList;
//
// 🎨 Inline styles – consistentes com o restante do sistema Nexus
//
const styles = {
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        marginTop: "0.25rem",
        paddingBottom: "0.75rem",
    },
    link: {
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        background: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(148,163,184,0.15)",
        borderRadius: "8px",
        padding: "0.6rem 0.75rem",
        color: "#f8fafc",
        transition: "border 0.2s ease, background 0.2s ease",
    },
    activeLink: {
        border: "1px solid rgba(99,102,241,0.7)",
        background: "rgba(79,70,229,0.2)",
    },
    linkHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.15rem",
        gap: "0.5rem",
    },
    title: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#f1f5f9",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "160px",
    },
    badge: {
        fontSize: "0.65rem",
        color: "#cbd5f5",
        padding: "0.1rem 0.45rem",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.45px",
        border: "1px solid rgba(148,163,184,0.3)",
    },
    subtitle: {
        fontSize: "0.72rem",
        color: "#94a3b8",
        marginBottom: "0.25rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
    },
    meta: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.7rem",
        color: "#94a3b8",
    },
    muted: {
        color: "#94a3b8",
        fontSize: "0.9rem",
        padding: "0.5rem",
    },
};
