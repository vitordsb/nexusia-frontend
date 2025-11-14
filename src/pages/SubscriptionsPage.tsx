import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/auth";
import {
  createSubscriptionCheckout,
  createSubscriptionPixCheckout,
  listSubscriptionPlans,
  type PixPaymentData,
  type SubscriptionPlan,
} from "../api/payments";
import { useAuth } from "../context/AuthContext";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const formatCredits = (value: number | null) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const SubscriptionsPage = () => {
  const { userId, username, email, credits, token, setAuthData } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pixCpf, setPixCpf] = useState("");
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [pixResult, setPixResult] = useState<{
    plan: SubscriptionPlan;
    payment: PixPaymentData;
  } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const status = new URLSearchParams(location.search).get("status");
    if (status === "success") {
      setFeedback({
        type: "success",
        message: "Pagamento confirmado pelo Mercado Pago. O crédito será liberado em instantes.",
      });
    } else if (status === "failure") {
      setFeedback({
        type: "error",
        message: "O pagamento não foi concluído. Você pode tentar novamente.",
      });
    }
  }, [location.search]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const data = await listSubscriptionPlans();
        setPlans(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os planos disponíveis.",
        );
      } finally {
        setIsLoadingPlans(false);
      }
    };

    void fetchPlans();
  }, []);

  const preferredName = useMemo(
    () => username?.trim() || email || "Usuário Nexus",
    [username, email],
  );
  const sanitizedCpf = useMemo(
    () => pixCpf.replace(/\D/g, ""),
    [pixCpf]
  );

  const handleRefreshCredits = async () => {
    if (!userId || !token) return;
    try {
      const profile = await fetchUserProfile(userId);
      setAuthData({
        token,
        userId: profile.id,
        username: profile.username,
        email: profile.email,
        credits: profile.credits ?? 0,
      });
      setFeedback({
        type: "success",
        message: "Saldo atualizado com sucesso!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível atualizar o saldo agora.",
      });
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!userId || !email) {
      setFeedback({
        type: "error",
        message: "Não conseguimos identificar o usuário atual.",
      });
      return;
    }

    setActionPlanId(planId);
    try {
      const checkout = await createSubscriptionCheckout({
        planId,
        user: {
          id: userId,
          name: preferredName,
          email,
        },
        backUrls: {
          success: `${window.location.origin}/assinaturas?status=success`,
          pending: `${window.location.origin}/assinaturas?status=pending`,
          failure: `${window.location.origin}/assinaturas?status=failure`,
        },
      });
      window.open(checkout.preference.init_point, "_blank", "noopener,noreferrer");
      setFeedback({
        type: "success",
        message: "Abrimos o Mercado Pago em uma nova aba. Finalize o pagamento por lá.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível iniciar o pagamento para este plano.",
      });
    } finally {
      setActionPlanId(null);
    }
  };

  const handlePixSubscribe = async (planId: string) => {
    if (!userId || !email) {
      setFeedback({
        type: "error",
        message: "Não conseguimos identificar o usuário atual.",
      });
      return;
    }
    if (!sanitizedCpf || sanitizedCpf.length < 11) {
      setFeedback({
        type: "error",
        message: "Informe um CPF válido (somente números) para gerar o PIX.",
      });
      return;
    }

    setIsPixLoading(true);
    setPixResult(null);
    try {
      const pixCheckout = await createSubscriptionPixCheckout({
        planId,
        user: {
          id: userId,
          name: preferredName,
          email,
        },
        document: {
          type: "CPF",
          number: sanitizedCpf,
        },
      });
      setPixResult(pixCheckout);
      setFeedback({
        type: "success",
        message: "PIX gerado! Use o QR Code abaixo para concluir o pagamento.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível gerar o PIX. Tente novamente.",
      });
    } finally {
      setIsPixLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixResult) return;
    try {
      await navigator.clipboard.writeText(
        pixResult.payment.transaction_data.qr_code,
      );
      setCopyFeedback("Código PIX copiado!");
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("Não foi possível copiar. Copie manualmente.");
    }
  };

  return (
    <div className="subscription-page">
      <header className="subscription-hero">
        <div>
          <p className="hero-label">Assinaturas NexusAI</p>
          <h1>Saldo e upgrades</h1>
          <p className="hero-description">
            Reforce seus créditos para continuar usando todos os modelos integrados da NexusAI.
            Cada R$ 1,00 equivale a 100 créditos.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <button className="btn btn-primary" onClick={handleRefreshCredits}>
            Atualizar saldo
          </button>
        </div>
      </header>

      <section className="credit-summary">
        <div className="credit-card">
          <span className="credit-label">Saldo atual</span>
          <div className="credit-value">
            {formatCredits(credits)} <small>créditos</small>
          </div>
          <p className="credit-subtitle">
            Equivalente a {formatBRL((credits ?? 0) / 100)} disponíveis para uso.
          </p>
        </div>
        <div className="credit-card">
          <span className="credit-label">Como funciona?</span>
          <ul className="credit-list">
            <li>1 crédito = R$ 0,01 (1 centavo)</li>
            <li>O débito acontece após cada resposta da IA</li>
            <li>Pagamentos aprovados liberam os créditos automaticamente</li>
          </ul>
        </div>
      </section>

      <section className="pix-config">
        <div>
          <label htmlFor="pix-cpf">CPF para pagamento via PIX</label>
          <input
            id="pix-cpf"
            inputMode="numeric"
            value={pixCpf}
            onChange={(e) => setPixCpf(e.target.value)}
            placeholder="Digite somente números"
          />
          <small>
            Utilizaremos este CPF para gerar o QR Code e liberar seus créditos.
          </small>
        </div>
      </section>

      {feedback && (
        <div
          className={`feedback-banner feedback-${feedback.type}`}
          role="status"
        >
          {feedback.message}
        </div>
      )}

      {error && (
        <div className="feedback-banner feedback-error" role="alert">
          {error}
        </div>
      )}

      <section className="plans-grid">
        {isLoadingPlans ? (
          <div className="plan-card">Carregando planos...</div>
        ) : (
          plans.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card ${plan.featured ? "plan-card--featured" : ""}`}
            >
              <div className="plan-header">
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
              </div>
              <div className="plan-price">
                <strong>{formatBRL(plan.price_brl)}</strong>
                <span>{formatCredits(plan.credits)} créditos</span>
              </div>
              <ul className="plan-benefits">
                <li>Créditos liberados: {formatCredits(plan.credits)}</li>
                <li>Valor proporcional: {formatBRL(plan.credits / 100)}</li>
                <li>Pagamento único via Mercado Pago</li>
              </ul>
              <div className="plan-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={actionPlanId === plan.id}
                >
                  {actionPlanId === plan.id
                    ? "Gerando link..."
                    : `Checkout (${formatBRL(plan.price_brl)})`}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handlePixSubscribe(plan.id)}
                  disabled={isPixLoading}
                >
                  {isPixLoading ? "Gerando PIX..." : "Gerar PIX"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {pixResult && (
        <section className="pix-result">
          <h3>PIX gerado para {pixResult.plan.name}</h3>
          <p>
            Valor: <strong>{formatBRL(pixResult.plan.price_brl)}</strong>
          </p>
          <div className="pix-result-content">
            {pixResult.payment.transaction_data.qr_code_base64 ? (
              <img
                src={`data:image/png;base64,${pixResult.payment.transaction_data.qr_code_base64}`}
                alt="QR Code PIX"
              />
            ) : (
              <p>Use o código abaixo no seu banco:</p>
            )}
            <div className="pix-code-box">
              <textarea
                readOnly
                value={pixResult.payment.transaction_data.qr_code}
              />
              <button className="btn btn-secondary" onClick={handleCopyPixCode}>
                Copiar código PIX
              </button>
              {copyFeedback && <small>{copyFeedback}</small>}
              {pixResult.payment.transaction_data.ticket_url && (
                <a
                  className="btn btn-link"
                  href={pixResult.payment.transaction_data.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir guia do Mercado Pago
                </a>
              )}
            </div>
          </div>
          <p className="text-muted">
            Após confirmar o pagamento em seu banco, clique em "Atualizar saldo".
            A liberação ocorre automaticamente assim que o Mercado Pago aprova o
            PIX.
          </p>
        </section>
      )}
    </div>
  );
};

export default SubscriptionsPage;
