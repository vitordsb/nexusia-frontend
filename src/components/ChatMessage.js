import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const roleLabels = {
    user: "Você",
    assistant: "NexusAI",
    system: "Sistema"
};
const ChatMessage = ({ message }) => {
    const { role, content, timestamp, isLoading } = message;
    const alignment = role === "user" ? "message user" : `message ${role}`;
    const formattedTimestamp = timestamp && !isLoading
        ? new Date(timestamp).toLocaleString("pt-BR")
        : null;
    return (_jsx("div", { className: alignment, children: _jsxs("div", { className: `message-bubble${isLoading ? " message-bubble-loading" : ""}`, children: [_jsxs("div", { className: "text-muted", style: { fontSize: "0.75rem", marginBottom: "0.35rem" }, children: [roleLabels[role] ?? role, isLoading ? " · respondendo..." : null, formattedTimestamp ? ` · ${formattedTimestamp}` : null] }), isLoading ? (_jsxs("div", { className: "message-loading-state", "aria-live": "polite", children: [_jsx("span", { className: "spinner", "aria-hidden": "true" }), _jsxs("div", { className: "message-loading-lines", "aria-hidden": "true", children: [_jsx("span", { className: "message-loading-line" }), _jsx("span", { className: "message-loading-line short" }), _jsx("span", { className: "message-loading-line xshort" })] }), _jsx("span", { className: "message-loading-label", children: "Gerando resposta..." })] })) : (_jsx("div", { style: { whiteSpace: "pre-wrap" }, children: content }))] }) }));
};
export default ChatMessage;
