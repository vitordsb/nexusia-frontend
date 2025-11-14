
import { Link } from "react-router-dom";
import type { ConversationSummary } from "../types";

type ConversationListProps = {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error?: string | null;
  activeConversationId?: string;
  onSelect?: () => void;
};

const ConversationList = ({
  conversations,
  isLoading,
  error,
  activeConversationId,
  onSelect,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="conversation-skeleton" aria-live="polite" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="conversation-skeleton-card">
            <div className="conversation-skeleton-line" />
            <div className="conversation-skeleton-line short" />
            <div className="conversation-skeleton-meta">
              <span className="conversation-skeleton-line xshort" />
              <span className="conversation-skeleton-line xshort" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ ...styles.muted, color: "#f87171" }} role="alert">
        {error}
      </p>
    );
  }

  if (!conversations.length) {
    return (
      <p style={styles.muted}>
        Nenhuma conversa encontrada. Crie uma nova para começar.
      </p>
    );
  }

  return (
    <div style={styles.listContainer}>
      {conversations.map((conversation) => {
        const updatedAt = new Date(conversation.updated_at).toLocaleString("pt-BR");
        const isActive = conversation.conversation_id === activeConversationId;
        return (
          <Link
            key={conversation.conversation_id}
            to={`/conversations/${conversation.conversation_id}`}
            style={{
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            }}
            onClick={onSelect}
          >
            <div style={styles.linkHeader}>
              <span style={styles.title}>
                {conversation.title || conversation.conversation_id}
              </span>
              <span
                style={{
                  ...styles.badge,
                  backgroundColor: isActive ? "#3b82f6" : "#334155",
                }}
              >
                {conversation.model}
              </span>
            </div>

            <span style={styles.subtitle}>modo {conversation.mode}</span>

            <div style={styles.meta}>
              <span>mensagens · {conversation.message_count}</span>
              <span>{updatedAt}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ConversationList;

//
// 🎨 Inline styles – consistentes com o restante do sistema Nexus
//
const styles: Record<string, React.CSSProperties> = {
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  link: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#f1f5f9",
    transition: "background 0.2s ease, border 0.2s ease, transform 0.1s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  activeLink: {
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.4)",
    transform: "scale(1.01)",
  },
  linkHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.25rem",
  },
  title: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  badge: {
    fontSize: "0.7rem",
    color: "white",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "0.35rem",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#64748b",
  },
  muted: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    padding: "0.5rem",
  },
};
