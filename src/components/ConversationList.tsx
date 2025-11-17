import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({
    showTopOverlay: false,
    showBottomOverlay: false,
  });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateOverlay = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScrollTop = scrollHeight - clientHeight;
      const nextState = {
        showTopOverlay: scrollTop > 8,
        showBottomOverlay: maxScrollTop > 4 && scrollTop < maxScrollTop - 4,
      };

      setScrollState((current) =>
        current.showTopOverlay === nextState.showTopOverlay &&
        current.showBottomOverlay === nextState.showBottomOverlay
          ? current
          : nextState,
      );
    };

    updateOverlay();
    container.addEventListener("scroll", updateOverlay);
    return () => container.removeEventListener("scroll", updateOverlay);
  }, [conversations, isLoading, error]);

  const renderContent = () => {
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

  return (
    <div className="sidebar-list-wrapper">
      <div className="sidebar-list-viewport" ref={scrollRef}>
        {renderContent()}
      </div>
      <div
        className={`sidebar-list-fade sidebar-list-fade-top${
          scrollState.showTopOverlay ? " is-visible" : ""
        }`}
        aria-hidden="true"
      />
      <div
        className={`sidebar-list-fade sidebar-list-fade-bottom${
          scrollState.showBottomOverlay ? " is-visible" : ""
        }`}
        aria-hidden="true"
      />
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
    gap: "0.35rem",
    marginTop: "0.25rem",
    paddingBottom: "0.75rem",
  },
  link: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "8px",
    padding: "0.6rem 0.75rem",
    color: "#f8fafc",
    transition: "border 0.2s ease, background 0.2s ease",
  },
  activeLink: {
    border: "1px solid rgba(99,102,241,0.7)",
    background: "rgba(79,70,229,0.2)",
  },
  linkHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.15rem",
    gap: "0.5rem",
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#f1f5f9",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  },
  badge: {
    fontSize: "0.65rem",
    color: "#cbd5f5",
    padding: "0.1rem 0.45rem",
    borderRadius: "999px",
    textTransform: "uppercase",
    letterSpacing: "0.45px",
    border: "1px solid rgba(148,163,184,0.3)",
  },
  subtitle: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    marginBottom: "0.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    color: "#94a3b8",
  },
  muted: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    padding: "0.5rem",
  },
};
