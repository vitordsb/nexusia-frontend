import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
const MessageComposer = ({ onSend, isSending, isBusy = false, busyLabel = "Carregando...", creditCost, model, mode, }) => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);
    const isDisabled = isSending || isBusy;
    const sendMessage = async () => {
        if (isDisabled) {
            return;
        }
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
    const handleSubmit = async (event) => {
        event.preventDefault();
        await sendMessage();
    };
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
        }
    };
    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }
        const textarea = textareaRef.current;
        const maxHeight = 160;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [message]);
    const formattedCost = typeof creditCost === "number"
        ? new Intl.NumberFormat("pt-BR").format(creditCost)
        : null;
    return (_jsxs("form", { onSubmit: handleSubmit, className: "message-composer", children: [_jsxs("div", { className: "text-muted", style: { fontSize: "0.85rem" }, children: ["Modelo ", model, " \u00B7 modo ", mode, formattedCost ? ` · custo estimado ${formattedCost} créditos` : null] }), _jsxs("div", { className: "message-composer-row", children: [_jsx("textarea", { ref: textareaRef, rows: 1, placeholder: "Digite sua mensagem...", value: message, onChange: (event) => setMessage(event.target.value), onKeyDown: handleKeyDown }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isDisabled, children: isSending ? "Enviando..." : isBusy ? busyLabel : "Enviar" })] }), error ? (_jsx("p", { role: "alert", className: "text-muted", style: { marginTop: "0.5rem" }, children: error })) : null] }));
};
export default MessageComposer;
