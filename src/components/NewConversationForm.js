import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
const defaultModel = "gpt-5-mini";
const defaultMode = "low";
const NewConversationForm = ({ onCreated, variant = "panel", onCancel, }) => {
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
                mode,
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
    const isSidebar = variant === "sidebar";
    return (_jsxs("form", { className: isSidebar ? "sidebar-form" : "panel", onSubmit: handleSubmit, style: {
            background: isSidebar ? "rgba(30,41,59,0.9)" : "rgba(15,23,42,0.9)",
            color: "white",
            padding: isSidebar ? "1rem" : "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: isSidebar
                ? "0 2px 10px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease",
        }, children: [_jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                }, children: [_jsx("h2", { style: { margin: 0, fontSize: isSidebar ? "1.1rem" : "1.3rem" }, children: "Nova conversa" }), isSidebar && (_jsx("button", { type: "button", onClick: onCancel, "aria-label": "Fechar formul\u00E1rio", style: {
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            fontSize: "1.2rem",
                            cursor: "pointer",
                        }, children: "\u00D7" }))] }), _jsxs("div", { style: { marginBottom: "1rem" }, children: [_jsx("label", { htmlFor: "conversation-title", style: { display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }, children: "T\u00EDtulo" }), _jsx("input", { id: "conversation-title", placeholder: "Ex.: Ideias de campanha de marketing", value: title, onChange: (e) => setTitle(e.target.value), style: inputStyle })] }), _jsxs("div", { style: {
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                }, children: [_jsxs("div", { style: { flex: 1, minWidth: "200px" }, children: [_jsx("label", { htmlFor: "conversation-model", style: { display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }, children: "Modelo" }), _jsxs("select", { id: "conversation-model", value: model, onChange: (e) => setModel(e.target.value), style: selectStyle, children: [_jsx("option", { value: "gpt-5", children: "GPT-5" }), _jsx("option", { value: "gpt-5-pro", children: "GPT-5 Pro" }), _jsx("option", { value: "gpt-5-mini", children: "GPT-5 Mini" }), _jsx("option", { value: "claude-opus-4-1", children: "Claude Opus 4.1" }), _jsx("option", { value: "claude-sonnet-4-5", children: "Claude Sonnet 4.5" }), _jsx("option", { value: "claude-haiku-4-5", children: "Claude Haiku 4.5" })] })] }), _jsxs("div", { style: { width: "160px" }, children: [_jsx("label", { htmlFor: "conversation-mode", style: { display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }, children: "Modo" }), _jsxs("select", { id: "conversation-mode", value: mode, onChange: (e) => setMode(e.target.value), style: selectStyle, children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] })] }), error && (_jsx("p", { role: "alert", style: {
                    color: "#f87171",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                }, children: error })), _jsxs("div", { style: { display: "flex", gap: "0.5rem", marginTop: "1.25rem" }, children: [_jsx("button", { type: "submit", disabled: isSubmitting, style: {
                            flex: 1,
                            background: isSubmitting ? "#475569" : "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.6rem 1rem",
                            fontSize: "0.95rem",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                        }, onMouseOver: (e) => {
                            if (!isSubmitting)
                                e.currentTarget.style.background = "#2563eb";
                        }, onMouseOut: (e) => {
                            if (!isSubmitting)
                                e.currentTarget.style.background = "#3b82f6";
                        }, onMouseDown: (e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                        }, onMouseUp: (e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }, children: isSubmitting ? "Criando..." : "Criar conversa" }), variant === "sidebar" && (_jsx("button", { type: "button", onClick: onCancel, style: {
                            background: "transparent",
                            color: "#cbd5e1",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                            padding: "0.6rem 1rem",
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }, onMouseOver: (e) => (e.currentTarget.style.background = "rgba(71,85,105,0.3)"), onMouseOut: (e) => (e.currentTarget.style.background = "transparent"), children: "Cancelar" }))] })] }));
};
export default NewConversationForm;
function generateId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 10);
}
// 🔹 Estilos reutilizáveis
const inputStyle = {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "white",
    outline: "none",
    fontSize: "0.95rem",
    transition: "border 0.2s ease",
};
const selectStyle = {
    width: "100%",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "white",
    outline: "none",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "border 0.2s ease",
};
