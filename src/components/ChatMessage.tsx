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
  const { role, content, timestamp } = message;
  const alignment = role === "user" ? "message user" : `message ${role}`;

  return (
    <div className={alignment}>
      <div className="message-bubble">
        <div
          className="text-muted"
          style={{ fontSize: "0.75rem", marginBottom: "0.35rem" }}
        >
          {roleLabels[role] ?? role}
          {timestamp ? ` · ${new Date(timestamp).toLocaleString("pt-BR")}` : null}
        </div>
        <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
