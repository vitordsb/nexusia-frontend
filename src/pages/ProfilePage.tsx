import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getModelDisplayName } from "../utils/credits";

const quickTopUps = [50, 100, 250, 500];

const formatCredits = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const ProfilePage = () => {
  const {
    username,
    email,
    userId,
    credits,
    creditUsage,
    creditHistory,
    topUpCredits,
  } = useAuth();
  const [customAmount, setCustomAmount] = useState("100");
  const [feedback, setFeedback] = useState<string | null>(null);
  const navigate = useNavigate();

  const preferredName = username?.trim() || email || "Usuário Nexus";
  const usageEntries = useMemo(
    () =>
      Object.entries(creditUsage ?? {}).sort(
        (a, b) => (b[1] ?? 0) - (a[1] ?? 0),
      ),
    [creditUsage],
  );
  const totalUsed = useMemo(
    () => usageEntries.reduce((sum, [, value]) => sum + (value ?? 0), 0),
    [usageEntries],
  );
  const latestHistory = creditHistory.slice(0, 6);

  const handleQuickAdd = (amount: number) => {
    void handleAddCredits(amount, `Recarga rápida (${amount} créditos)`);
  };

  const handleAddCredits = async (amount: number, note?: string) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback("Informe um valor maior que zero para adicionar créditos.");
      return;
    }
    try {
      await topUpCredits(Math.round(amount), note ?? "Recarga simulada");
      setFeedback(
        `Adicionamos ${formatCredits(amount)} créditos ao seu saldo.`,
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar créditos agora.",
      );
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCustomSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const numericValue = Number(customAmount);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setFeedback("Use apenas números positivos para recarregar.");
      return;
    }
    await handleAddCredits(numericValue, "Recarga personalizada");
    setCustomAmount("");
  };

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero-info">
          <p className="hero-label">Central do cliente</p>
          <h1>Olá, {preferredName}</h1>
          <p className="hero-description">
            Simule recargas locais para testar fluxos com GPT e acompanhe o consumo de
            créditos por IA. Nenhum dado financeiro real é enviado.
          </p>
          <div className="profile-hero-tags">
            <span className="profile-tag">ID: {userId ?? "não encontrado"}</span>
            <span className="profile-tag">Email: {email ?? "não informado"}</span>
          </div>
        </div>
        <div className="profile-balance-card">
          <span className="profile-balance-label">Saldo disponível</span>
          <strong className="profile-balance-value">
            {formatCredits(credits)} <small>créditos</small>
          </strong>
          <p className="profile-balance-sub">
            Total consumido nesta sessão: {formatCredits(totalUsed)} créditos
          </p>
          <div className="profile-balance-actions">
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          </div>
        </div>
      </header>

      <section className="profile-grid">
        <div className="panel profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Simular entrada de créditos</h2>
              <p>Adicione créditos fictícios para liberar o uso dos modelos GPT.</p>
            </div>
            <span className="profile-chip">Modo simulado</span>
          </div>

          <form className="credit-form" onSubmit={handleCustomSubmit}>
            <label htmlFor="custom-credit">Valor personalizado</label>
            <div className="credit-input-row">
              <input
                id="custom-credit"
                type="number"
                min={1}
                placeholder="Ex.: 150"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Adicionar
              </button>
            </div>
          </form>

          <div className="quick-add">
            <span>Ou selecione um valor rápido:</span>
            <div className="quick-add-buttons">
              {quickTopUps.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="quick-add-button"
                  onClick={() => handleQuickAdd(amount)}
                >
                  +{formatCredits(amount)}
                </button>
              ))}
            </div>
          </div>

          {feedback ? (
            <p role="status" className="profile-feedback">
              {feedback}
            </p>
          ) : (
            <p className="profile-hint">
              Os créditos simulados ficam associados à sua conta e servem apenas para
              testes internos. Nenhum pagamento real é processado.
            </p>
          )}
        </div>

        <div className="panel profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Consumo por IA</h2>
              <p>Totais acumulados desde o último login.</p>
            </div>
          </div>
          {usageEntries.length ? (
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Créditos usados</th>
                  <th>Participação</th>
                </tr>
              </thead>
              <tbody>
                {usageEntries.map(([model, value]) => {
                  const percent = totalUsed
                    ? `${((value / totalUsed) * 100).toFixed(1)}%`
                    : "—";
                  return (
                    <tr key={model}>
                      <td>
                        <div className="usage-model">
                          <strong>{getModelDisplayName(model)}</strong>
                          <span>{model}</span>
                        </div>
                      </td>
                      <td>{formatCredits(value)}</td>
                      <td>{percent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="profile-hint">Ainda não há consumo registrado nesta conta.</p>
          )}
        </div>
      </section>

      <section className="panel profile-history">
        <div className="profile-card-header">
          <div>
            <h2>Histórico de movimentos</h2>
            <p>Últimas recargas e débitos simulados.</p>
          </div>
        </div>
        {latestHistory.length ? (
          <ul className="history-list">
            {latestHistory.map((entry) => {
              const metadata =
                entry.metadata && typeof entry.metadata === "object"
                  ? entry.metadata
                  : null;
              const modelName =
                metadata && "model" in metadata
                  ? getModelDisplayName(String(metadata.model))
                  : getModelDisplayName("IA");
              const conversationId =
                metadata && "conversation_id" in metadata
                  ? String(metadata.conversation_id)
                  : "—";
              const note =
                metadata && "note" in metadata
                  ? String(metadata.note)
                  : "Recarga registrada";
              const isCredit = entry.direction === "credit";
              return (
                <li key={entry.id} className="history-item">
                  <div className={`history-icon ${isCredit ? "topup" : "usage"}`}>
                    {isCredit ? "⬆" : "⬇"}
                  </div>
                  <div className="history-content">
                    <strong>{isCredit ? note : modelName}</strong>
                    <span>
                      {formatDateTime(entry.createdAt)} ·{" "}
                      {isCredit ? "Saldo adicionado" : `Conversa ${conversationId}`}
                    </span>
                  </div>
                  <span className={`history-amount ${isCredit ? "topup" : "usage"}`}>
                    {isCredit ? "+" : "-"} {formatCredits(entry.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="profile-hint">
            Nada por aqui ainda. Conduza uma conversa para gerar consumo e veja as
            movimentações aparecerem.
          </p>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
