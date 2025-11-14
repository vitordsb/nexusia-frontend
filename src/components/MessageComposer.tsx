import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type MessageComposerProps = {
  onSend: (content: string) => Promise<void> | void;
  isSending: boolean;
  isBusy?: boolean;
  busyLabel?: string;
  creditCost?: number;
  model: string;
  mode: "low" | "medium" | "high";
};

const MessageComposer = ({
  onSend,
  isSending,
  isBusy = false,
  busyLabel = "Carregando...",
  creditCost,
  model,
  mode,
}: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
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

  const formattedCost =
    typeof creditCost === "number"
      ? new Intl.NumberFormat("pt-BR").format(creditCost)
      : null;

  return (
    <form onSubmit={handleSubmit} className="message-composer">
      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
        Modelo {model} · modo {mode}
        {formattedCost ? ` · custo estimado ${formattedCost} créditos` : null}
      </div>
      <div className="message-composer-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isDisabled}
        >
          {isSending ? "Enviando..." : isBusy ? busyLabel : "Enviar"}
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
