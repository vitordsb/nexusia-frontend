import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const roleLabels = {
    user: "Você",
    assistant: "NexusAI",
    system: "Sistema"
};
const thinkingSteps = [
    "Analisando contexto e histórico...",
    "Gerando possíveis caminhos de resposta...",
    "Organizando ideias em uma resposta clara...",
    "Validando consistência e exemplos...",
    "Finalizando e revisando a mensagem...",
];
const ChatMessage = ({ message }) => {
    const { role, content, timestamp, isLoading, variant } = message;
    const alignment = role === "user" ? "message user" : `message ${role}`;
    const isError = variant === "error";
    const formattedTimestamp = timestamp && !isLoading
        ? new Date(timestamp).toLocaleString("pt-BR")
        : null;
    const [stepIndex, setStepIndex] = useState(0);
    useEffect(() => {
        if (!isLoading)
            return;
        setStepIndex(0);
        const interval = setInterval(() => {
            setStepIndex((current) => (current + 1) % thinkingSteps.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [isLoading]);
    const statusText = useMemo(() => {
        if (isError) {
            return "Falha ao responder";
        }
        if (isLoading) {
            return thinkingSteps[stepIndex];
        }
        return formattedTimestamp ?? undefined;
    }, [formattedTimestamp, isError, isLoading, stepIndex]);
    return (_jsxs("div", { className: alignment, children: [_jsxs("div", { className: "message-meta", children: [_jsx("span", { className: "message-author", children: roleLabels[role] ?? role }), statusText ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "message-separator", "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "message-status", children: statusText })] })) : null] }), _jsx("div", { className: `message-content${isLoading ? " is-loading" : ""}${isError ? " is-error" : ""}`, children: isLoading ? (_jsxs("div", { className: "message-loading-state", "aria-live": "polite", children: [_jsx("span", { className: "spinner", "aria-hidden": "true" }), _jsx("div", { className: "message-thinking-steps", children: thinkingSteps.map((step, index) => (_jsx("span", { className: `message-thinking-step${index === stepIndex ? " is-active" : ""}`, children: step }, step))) })] })) : (_jsx("div", { className: `message-text${isError ? " message-text-error" : ""}`, children: content })) })] }));
};
export default ChatMessage;
