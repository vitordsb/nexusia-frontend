import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
const defaultModel = "gpt-5";
const defaultMode = "medium";
const NewConversationForm = ({ onCreated, variant = "panel", onCancel }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [model, setModel] = useState(defaultModel);
    const [mode, setMode] = useState(defaultMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token)
            return;
        setError(null);
        setIsSubmitting(true);
        const conversationId = `conv-${generateId()}`;
        try {
            await createConversation(token, {
                conversation_id: conversationId,
                title: title || `Conversa ${new Date().toLocaleString("pt-BR")}`,
                model,
                mode
            });
            setTitle("");
            setModel(defaultModel);
            setMode(defaultMode);
            if (onCreated) {
                onCreated(conversationId);
            }
            else {
                navigate(`/conversations/${conversationId}`);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar conversa");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("form", { className: variant === "panel" ? "panel" : "sidebar-form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "sidebar-form-header", children: [_jsx("h2", { style: { margin: 0, fontSize: "1.15rem" }, children: "Nova conversa" }), variant === "sidebar" ? (_jsx("button", { type: "button", className: "sidebar-form-close", onClick: onCancel, "aria-label": "Fechar formul\u00E1rio de nova conversa", children: "\u00D7" })) : null] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "conversation-title", children: "T\u00EDtulo" }), _jsx("input", { id: "conversation-title", placeholder: "Ex.: Ideias de campanha de marketing", value: title, onChange: (event) => setTitle(event.target.value) })] }), _jsxs("div", { className: "form-row", style: { marginTop: "1rem", flexWrap: "wrap" }, children: [_jsxs("div", { className: "form-group", style: { flex: 1, minWidth: "200px" }, children: [_jsx("label", { htmlFor: "conversation-model", children: "Modelo" }), _jsxs("select", { id: "conversation-model", value: model, onChange: (event) => setModel(event.target.value), children: [_jsx("option", { value: "gpt-5", children: "GPT\u20115" }), _jsx("option", { value: "gpt-5-pro", children: "GPT\u20115 Pro" }), _jsx("option", { value: "gpt-5-mini", children: "GPT\u20115 Mini" }), _jsx("option", { value: "claude-opus-4-1", children: "Claude Opus 4.1" }), _jsx("option", { value: "claude-sonnet-4-5", children: "Claude Sonnet 4.5" }), _jsx("option", { value: "claude-haiku-4-5", children: "Claude Haiku 4.5" }), _jsx("option", { value: "gemini-2-5-pro", children: "Gemini 2.5 Pro" }), _jsx("option", { value: "gemini-2-5-flash", children: "Gemini 2.5 Flash" })] })] }), _jsxs("div", { className: "form-group", style: { width: "160px" }, children: [_jsx("label", { htmlFor: "conversation-mode", children: "Modo" }), _jsxs("select", { id: "conversation-mode", value: mode, onChange: (event) => setMode(event.target.value), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] })] }), error ? (_jsx("p", { role: "alert", className: "text-muted", style: { marginTop: "0.75rem" }, children: error })) : null, _jsxs("div", { style: { display: "flex", gap: "0.5rem", marginTop: "1.25rem" }, children: [_jsx("button", { type: "submit", className: "btn btn-primary", disabled: isSubmitting, children: isSubmitting ? "Criando..." : "Criar conversa" }), variant === "sidebar" ? (_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onCancel, children: "Cancelar" })) : null] })] }));
};
export default NewConversationForm;
function generateId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 10);
}
