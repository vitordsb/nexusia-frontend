import { FormEvent, useState } from "react";

type MessageComposerProps = {
  onSend: (content: string) => Promise<void> | void;
  isSending: boolean;
  model: string;
  mode: "low" | "medium" | "high";
};

const MessageComposer = ({ onSend, isSending, model, mode }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-composer">
      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
        Modelo {model} · modo {mode}
      </div>
      <div className="message-composer-row">
        <textarea
          rows={3}
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSending}
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-muted" style={{ marginTop: "0.5rem" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
};

export default MessageComposer;
