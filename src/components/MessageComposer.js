import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
const MessageComposer = ({ onSend, isSending, model, mode }) => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmed = message.trim();
        if (!trimmed) {
            setError("Digite uma mensagem para enviar.");
            return;
        }
        setError(null);
        try {
            await onSend(trimmed);
            setMessage("");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "message-composer", children: [_jsxs("div", { className: "text-muted", style: { fontSize: "0.85rem" }, children: ["Modelo ", model, " \u00B7 modo ", mode] }), _jsxs("div", { className: "message-composer-row", children: [_jsx("textarea", { rows: 3, placeholder: "Digite sua mensagem...", value: message, onChange: (event) => setMessage(event.target.value) }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isSending, children: isSending ? "Enviando..." : "Enviar" })] }), error ? (_jsx("p", { role: "alert", className: "text-muted", style: { marginTop: "0.5rem" }, children: error })) : null] }));
};
export default MessageComposer;
