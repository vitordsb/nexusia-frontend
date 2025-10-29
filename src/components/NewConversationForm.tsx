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

const defaultModel = "gpt-5";
const defaultMode: CreateConversationPayload["mode"] = "medium";

const NewConversationForm = ({
  onCreated,
  variant = "panel",
  onCancel
}: NewConversationFormProps) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [mode, setMode] = useState(defaultMode);
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
        mode
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
    >
      <div
        className={isSidebar ? "sidebar-form-header" : undefined}
        style={
          isSidebar
            ? undefined
            : {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem"
            }
        }
      >
        <h2 style={{ margin: 0, fontSize: isSidebar ? "1.15rem" : "1.35rem" }}>
          Nova conversa
        </h2>
        {isSidebar ? (
          <button
            type="button"
            className="sidebar-form-close"
            onClick={onCancel}
            aria-label="Fechar formulário de nova conversa"
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="form-group">
        <label htmlFor="conversation-title">Título</label>
        <input
          id="conversation-title"
          placeholder="Ex.: Ideias de campanha de marketing"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="form-row" style={{ marginTop: "1rem", flexWrap: "wrap" }}>
        <div className="form-group" style={{ flex: 1, minWidth: "200px" }}>
          <label htmlFor="conversation-model">Modelo</label>
          <select
            id="conversation-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            <option value="gpt-5">GPT‑5</option>
            <option value="gpt-5-pro">GPT‑5 Pro</option>
            <option value="gpt-5-mini">GPT‑5 Mini</option>
            <option value="claude-opus-4-1">Claude Opus 4.1</option>
            <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
            <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
            <option value="gemini-2-5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2-5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>
        <div className="form-group" style={{ width: "160px" }}>
          <label htmlFor="conversation-mode">Modo</label>
          <select
            id="conversation-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as typeof defaultMode)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-muted" style={{ marginTop: "0.75rem" }}>
          {error}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando..." : "Criar conversa"}
        </button>
        {variant === "sidebar" ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
        ) : null}
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
