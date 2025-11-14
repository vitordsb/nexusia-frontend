import type { Message } from "../types";

type ChatMessageProps = {
  message: Message;
};

const roleLabels: Record<string, string> = {
  user: "Você",
  assistant: "NexusAI",
  system: "Sistema"
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { role, content, timestamp, isLoading } = message;
  const alignment = role === "user" ? "message user" : `message ${role}`;
  const formattedTimestamp =
    timestamp && !isLoading
      ? new Date(timestamp).toLocaleString("pt-BR")
      : null;

  return (
    <div className={alignment}>
      <div className={`message-bubble${isLoading ? " message-bubble-loading" : ""}`}>
        <div
          className="text-muted"
          style={{ fontSize: "0.75rem", marginBottom: "0.35rem" }}
        >
          {roleLabels[role] ?? role}
          {isLoading ? " · respondendo..." : null}
          {formattedTimestamp ? ` · ${formattedTimestamp}` : null}
        </div>
        {isLoading ? (
          <div className="message-loading-state" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <div className="message-loading-lines" aria-hidden="true">
              <span className="message-loading-line" />
              <span className="message-loading-line short" />
              <span className="message-loading-line xshort" />
            </div>
            <span className="message-loading-label">Gerando resposta...</span>
          </div>
        ) : (
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
