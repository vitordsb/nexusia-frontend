import { Link } from "react-router-dom";
import type { ConversationSummary } from "../types";

type ConversationListProps = {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error?: string | null;
  activeConversationId?: string;
};

const ConversationList = ({
  conversations,
  isLoading,
  error,
  activeConversationId
}: ConversationListProps) => {
  if (isLoading) {
    return <p className="text-muted">Carregando conversas...</p>;
  }

  if (error) {
    return (
      <p className="text-muted" role="alert">
        {error}
      </p>
    );
  }

  if (!conversations.length) {
    return (
      <p className="text-muted">
        Nenhuma conversa encontrada. Crie uma nova para começar.
      </p>
    );
  }

  return (
    <div className="sidebar-list">
      {conversations.map((conversation) => {
        const updatedAt = new Date(conversation.updated_at).toLocaleString("pt-BR");
        return (
          <Link
            key={conversation.conversation_id}
            to={`/conversations/${conversation.conversation_id}`}
            className={`sidebar-link${
              conversation.conversation_id === activeConversationId ? " is-active" : ""
            }`}
          >
            <span className="sidebar-link-title">
              {conversation.title || conversation.conversation_id}
            </span>
            <span className="text-muted">
              {conversation.model} · modo {conversation.mode}
            </span>
            {conversation.last_message_preview ? (
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                {conversation.last_message_preview}
              </span>
            ) : null}
            <div className="sidebar-link-meta">
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
