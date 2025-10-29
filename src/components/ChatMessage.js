import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const roleLabels = {
    user: "Você",
    assistant: "NexusAI",
    system: "Sistema"
};
const ChatMessage = ({ message }) => {
    const { role, content, timestamp } = message;
    const alignment = role === "user" ? "message user" : `message ${role}`;
    return (_jsx("div", { className: alignment, children: _jsxs("div", { className: "message-bubble", children: [_jsxs("div", { className: "text-muted", style: { fontSize: "0.75rem", marginBottom: "0.35rem" }, children: [roleLabels[role] ?? role, timestamp ? ` · ${new Date(timestamp).toLocaleString("pt-BR")}` : null] }), _jsx("div", { style: { whiteSpace: "pre-wrap" }, children: content })] }) }));
};
export default ChatMessage;
