
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
import type { CreateConversationPayload } from "../types";

type NewConversationFormProps = {
  onCreated?: (conversationId: string) => void;
  variant?: "panel" | "sidebar";
  onCancel?: () => void;
};

const defaultModel = "gpt-5-mini";
const defaultMode: CreateConversationPayload["mode"] = "low";

const NewConversationForm = ({
  onCreated,
  variant = "panel",
  onCancel,
}: NewConversationFormProps) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [mode, setMode] = useState<CreateConversationPayload["mode"]>(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

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
      } else {
        navigate(`/conversations/${conversationId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conversa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSidebar = variant === "sidebar";

  return (
    <form
      className={isSidebar ? "sidebar-form" : "panel"}
      onSubmit={handleSubmit}
      style={{
        background: isSidebar ? "rgba(30,41,59,0.9)" : "rgba(15,23,42,0.9)",
        color: "white",
        padding: isSidebar ? "1rem" : "1.5rem",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: isSidebar
          ? "0 2px 10px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.4)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: isSidebar ? "1.1rem" : "1.3rem" }}>
          Nova conversa
        </h2>
        {isSidebar && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar formulário"
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Campo título */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="conversation-title"
          style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}
        >
          Título
        </label>
        <input
          id="conversation-title"
          placeholder="Ex.: Ideias de campanha de marketing"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Campos modelo e modo */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            htmlFor="conversation-model"
            style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}
          >
            Modelo
          </label>
          <select
            id="conversation-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={selectStyle}
          >
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-5-pro">GPT-5 Pro</option>
            <option value="gpt-5-mini">GPT-5 Mini</option>
            <option value="claude-opus-4-1">Claude Opus 4.1</option>
            <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
            <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
          </select>
        </div>

        <div style={{ width: "160px" }}>
          <label
            htmlFor="conversation-mode"
            style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}
          >
            Modo
          </label>
          <select
            id="conversation-mode"
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as CreateConversationPayload["mode"])
            }
            style={selectStyle}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <p
          role="alert"
          style={{
            color: "#f87171",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </p>
      )}

      {/* Botões */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            flex: 1,
            background: isSubmitting ? "#475569" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1rem",
            fontSize: "0.95rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            if (!isSubmitting)
              e.currentTarget.style.background = "#2563eb";
          }}
          onMouseOut={(e) => {
            if (!isSubmitting)
              e.currentTarget.style.background = "#3b82f6";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isSubmitting ? "Criando..." : "Criar conversa"}
        </button>

        {variant === "sidebar" && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              color: "#cbd5e1",
              border: "1px solid #475569",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(71,85,105,0.3)")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default NewConversationForm;

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

// 🔹 Estilos reutilizáveis
const inputStyle: React.CSSProperties = {
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

const selectStyle: React.CSSProperties = {
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
