import { useEffect, useMemo, useState } from "react";
import type { Message } from "../types";

type ChatMessageProps = {
  message: Message;
};

const roleLabels: Record<string, string> = {
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

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { role, content, timestamp, isLoading, variant } = message;
  const alignment = role === "user" ? "message user" : `message ${role}`;
  const isError = variant === "error";
  const formattedTimestamp =
    timestamp && !isLoading
      ? new Date(timestamp).toLocaleString("pt-BR")
      : null;

  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
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

  return (
    <div className={alignment}>
      <div className="message-meta">
        <span className="message-author">{roleLabels[role] ?? role}</span>
        {statusText ? (
          <>
            <span className="message-separator" aria-hidden="true">
              ·
            </span>
            <span className="message-status">{statusText}</span>
          </>
        ) : null}
      </div>
      <div
        className={`message-content${
          isLoading ? " is-loading" : ""
        }${isError ? " is-error" : ""}`}
      >
        {isLoading ? (
          <div className="message-loading-state" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <div className="message-thinking-steps">
              {thinkingSteps.map((step, index) => (
                <span
                  key={step}
                  className={`message-thinking-step${
                    index === stepIndex ? " is-active" : ""
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={`message-text${isError ? " message-text-error" : ""}`}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
