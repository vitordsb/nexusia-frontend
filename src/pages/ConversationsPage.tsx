import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationList from "../components/ConversationList";
import NewConversationForm from "../components/NewConversationForm";
import { listConversations } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
import type { ConversationSummary } from "../types";

const quickActions = [
  {
    icon: "📊",
    title: "Análise de Dados",
    description: "Análise e visualização com IA especializada"
  },
  {
    icon: "💻",
    title: "Geração de Código",
    description: "Código otimizado com IA de programação"
  },
  {
    icon: "🎨",
    title: "Geração de Imagens",
    description: "Imagens criativas com IA visual"
  },
  {
    icon: "📚",
    title: "Conhecimento Geral",
    description: "Respostas precisas com IA generalista"
  }
];

const formatCredits = (value: number | null) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

const ConversationsPage = () => {
  const { token, userId, username, email, credits, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await listConversations(token);
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as conversas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [token]);

  const displayName = username ?? email ?? userId ?? "Usuário";
  const userInitials = displayName
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className={`app-shell ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar-close"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu"
        >
          ×
        </button>
        <div className="sidebar-top">
          <span className="sidebar-logo">Nexus AI</span>
          <button
            className="sidebar-new-button"
            type="button"
            onClick={() => setShowNewConversation((current) => !current)}
          >
            + Nova Conversa
          </button>
          {showNewConversation ? (
            <NewConversationForm
              variant="sidebar"
              onCancel={() => setShowNewConversation(false)}
              onCreated={(conversationId) => {
                setShowNewConversation(false);
                void fetchConversations();
                setIsSidebarOpen(false);
                navigate(`/conversations/${conversationId}`);
              }}
            />
          ) : null}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-title">Últimas conversas</span>
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            error={error}
            onSelect={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{userInitials || "U"}</div>
          <div className="sidebar-user">
            <strong>{displayName}</strong>
            <span>{email ?? "Conectado"}</span>
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Ocultar menu de conversas"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <main className="workspace">
        <div className="workspace-inner workspace-scroll">
          <header className="topbar">
            <div>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(true)}
              >
                Conversas
              </button>
              <div className="topbar-brand">Nexus AI</div>
              <div className="subtitle">
                Escolha uma conversa ou comece um novo fluxo com múltiplas IAs.
              </div>
            </div>
            <div className="topbar-actions">
              <div className="credits-pill">
                <span>Saldo</span>
                <strong>{formatCredits(credits)} créditos</strong>
              </div>
              <span className="topbar-status">
                <span className="status-dot" /> Multi-IA ativo
              </span>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate("/assinaturas")}
              >
                Assinaturas
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => navigate("/perfil")}
              >
                Perfil
              </button>
              <button className="btn btn-secondary" onClick={fetchConversations}>
                Atualizar
              </button>
            </div>
          </header>

          <section className="hero-panel">
            <div className="hero-icon" aria-hidden="true">🤖</div>
            <div>
              <h1 className="hero-title">Nexus AI</h1>
              <p className="hero-description">
                Sistema inteligente que integra múltiplas IAs especializadas,
                selecionando automaticamente a melhor IA para cada tipo de tarefa.
                Pergunte qualquer coisa e deixe o sistema escolher o modelo mais
                adequado.
              </p>
            </div>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <div key={action.title} className="quick-card">
                  <span style={{ fontSize: "1.3rem" }}>{action.icon}</span>
                  <span className="quick-card-title">{action.title}</span>
                  <span className="quick-card-sub">{action.description}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ConversationsPage;
