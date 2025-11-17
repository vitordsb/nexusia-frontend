import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Usage } from "../types";

type MessageComposerProps = {
  onSend: (content: string) => Promise<boolean | void> | boolean | void;
  isSending: boolean;
  isBusy?: boolean;
  busyLabel?: string;
  creditCost?: number;
  model: string;
  mode: "low" | "medium" | "high";
  availableCredits?: number | null;
  pendingDebit?: number;
  lastUsage?: Usage;
};

const MessageComposer = ({
  onSend,
  isSending,
  isBusy = false,
  busyLabel = "Carregando...",
  creditCost,
  model,
  mode,
  availableCredits,
  pendingDebit = 0,
  lastUsage,
}: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDisabled = isSending || isBusy;
  const [isLocked, setIsLocked] = useState(false);
  useEffect(() => {
    if (isDisabled) {
      setIsLocked(true);
    } else {
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

  const formatter = useMemo(
    () => new Intl.NumberFormat("pt-BR"),
    [],
  );

  const formattedCost =
    typeof creditCost === "number" ? formatter.format(creditCost) : null;

  const formattedRealtime =
    typeof availableCredits === "number" ? formatter.format(availableCredits) : null;

  const formattedPending =
    pendingDebit > 0 ? formatter.format(pendingDebit) : null;

  return (
    <form onSubmit={handleSubmit} className="message-composer">
      <div
        className="text-muted"
        style={{
          fontSize: "0.85rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.65rem",
          justifyContent: "space-between",
        }}
      >
        <span>
          Modelo {model} · modo {mode}
          {formattedCost ? ` · custo estimado ${formattedCost} créditos` : null}
        </span>
        {formattedRealtime ? (
          <span>
            Saldo em tempo real:
            <strong style={{ marginLeft: "0.3rem" }}>
              {formattedRealtime} créditos
            </strong>
            {formattedPending ? (
              <span style={{ marginLeft: "0.4rem", color: "#7c3aed" }}>
                (-{formattedPending} em processamento)
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
      {lastUsage ? (
        <div className="text-muted" style={{ fontSize: "0.8rem", marginTop: "-0.4rem" }}>
          Última resposta: {formatter.format(lastUsage.total_tokens)} tokens
          {" ("}
          prompt {formatter.format(lastUsage.prompt_tokens)}
          {" + "}
          saída {formatter.format(lastUsage.completion_tokens)}
          {") · custo real "}
          {formatter.format(lastUsage.cost_credits ?? 0)} créditos
        </div>
      ) : null}
      <div className="message-composer-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          className={isLocked ? "textarea-disabled" : undefined}
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
