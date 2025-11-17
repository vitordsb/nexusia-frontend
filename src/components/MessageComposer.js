import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
const MessageComposer = ({ onSend, isSending, isBusy = false, busyLabel = "Carregando...", creditCost, model, mode, availableCredits, pendingDebit = 0, lastUsage, }) => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);
    const isDisabled = isSending || isBusy;
    const [isLocked, setIsLocked] = useState(false);
    useEffect(() => {
        if (isDisabled) {
            setIsLocked(true);
        }
        else {
            const releaseDelay = setTimeout(() => setIsLocked(false), 200);
            return () => clearTimeout(releaseDelay);
        }
    }, [isDisabled]);
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
            const result = await onSend(trimmed);
            if (result !== false) {
                setMessage("");
            }
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
    const formatter = useMemo(() => new Intl.NumberFormat("pt-BR"), []);
    const formattedCost = typeof creditCost === "number" ? formatter.format(creditCost) : null;
    const formattedRealtime = typeof availableCredits === "number" ? formatter.format(availableCredits) : null;
    const formattedPending = pendingDebit > 0 ? formatter.format(pendingDebit) : null;
    return (_jsxs("form", { onSubmit: handleSubmit, className: "message-composer", children: [_jsxs("div", { className: "text-muted", style: {
                    fontSize: "0.85rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.65rem",
                    justifyContent: "space-between",
                }, children: [_jsxs("span", { children: ["Modelo ", model, " \u00B7 modo ", mode, formattedCost ? ` · custo estimado ${formattedCost} créditos` : null] }), formattedRealtime ? (_jsxs("span", { children: ["Saldo em tempo real:", _jsxs("strong", { style: { marginLeft: "0.3rem" }, children: [formattedRealtime, " cr\u00E9ditos"] }), formattedPending ? (_jsxs("span", { style: { marginLeft: "0.4rem", color: "#7c3aed" }, children: ["(-", formattedPending, " em processamento)"] })) : null] })) : null] }), lastUsage ? (_jsxs("div", { className: "text-muted", style: { fontSize: "0.8rem", marginTop: "-0.4rem" }, children: ["\u00DAltima resposta: ", formatter.format(lastUsage.total_tokens), " tokens", " (", "prompt ", formatter.format(lastUsage.prompt_tokens), " + ", "sa\u00EDda ", formatter.format(lastUsage.completion_tokens), ") · custo real ", formatter.format(lastUsage.cost_credits ?? 0), " cr\u00E9ditos"] })) : null, _jsxs("div", { className: "message-composer-row", children: [_jsx("textarea", { ref: textareaRef, rows: 1, placeholder: "Digite sua mensagem...", value: message, onChange: (event) => setMessage(event.target.value), onKeyDown: handleKeyDown, disabled: isLocked, className: isLocked ? "textarea-disabled" : undefined }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isDisabled, children: isSending ? "Enviando..." : isBusy ? busyLabel : "Enviar" })] }), error ? (_jsx("p", { role: "alert", className: "text-muted", style: { marginTop: "0.5rem" }, children: error })) : null] }));
};
export default MessageComposer;
