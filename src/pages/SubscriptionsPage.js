import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/auth";
import { createSubscriptionCheckout, createSubscriptionPixCheckout, listSubscriptionPlans, } from "../api/payments";
import { useAuth } from "../context/AuthContext";
const formatCredits = (value) => new Intl.NumberFormat("pt-BR").format(value ?? 0);
const formatBRL = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const SubscriptionsPage = () => {
    const { userId, username, email, credits, token, setAuthData, creditUsage, creditHistory, } = useAuth();
    const [plans, setPlans] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [actionPlanId, setActionPlanId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [pixCpf, setPixCpf] = useState("");
    const [isPixLoading, setIsPixLoading] = useState(false);
    const [pixResult, setPixResult] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const status = new URLSearchParams(location.search).get("status");
        if (status === "success") {
            setFeedback({
                type: "success",
                message: "Pagamento confirmado pelo Mercado Pago. O crédito será liberado em instantes.",
            });
        }
        else if (status === "failure") {
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
            }
            catch (err) {
                setError(err instanceof Error
                    ? err.message
                    : "Não foi possível carregar os planos disponíveis.");
            }
            finally {
                setIsLoadingPlans(false);
            }
        };
        void fetchPlans();
    }, []);
    const preferredName = useMemo(() => username?.trim() || email || "Usuário Nexus", [username, email]);
    const sanitizedCpf = useMemo(() => pixCpf.replace(/\D/g, ""), [pixCpf]);
    const handleRefreshCredits = async () => {
        if (!userId || !token)
            return;
        try {
            const profile = await fetchUserProfile(userId);
            setAuthData({
                token,
                userId: profile.id,
                username: profile.username,
                email: profile.email,
                credits: profile.credits ?? 0,
                creditHistory,
            });
            setFeedback({
                type: "success",
                message: "Saldo atualizado com sucesso!",
            });
        }
        catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error
                    ? err.message
                    : "Não foi possível atualizar o saldo agora.",
            });
        }
    };
    const handleSubscribe = async (planId) => {
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
        }
        catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error
                    ? err.message
                    : "Não foi possível iniciar o pagamento para este plano.",
            });
        }
        finally {
            setActionPlanId(null);
        }
    };
    const handlePixSubscribe = async (planId) => {
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
        }
        catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error
                    ? err.message
                    : "Não foi possível gerar o PIX. Tente novamente.",
            });
        }
        finally {
            setIsPixLoading(false);
        }
    };
    const handleCopyPixCode = async () => {
        if (!pixResult)
            return;
        try {
            await navigator.clipboard.writeText(pixResult.payment.transaction_data.qr_code);
            setCopyFeedback("Código PIX copiado!");
            setTimeout(() => setCopyFeedback(null), 2500);
        }
        catch {
            setCopyFeedback("Não foi possível copiar. Copie manualmente.");
        }
    };
    return (_jsxs("div", { className: "subscription-page", children: [_jsxs("header", { className: "subscription-hero", children: [_jsxs("div", { children: [_jsx("p", { className: "hero-label", children: "Assinaturas NexusAI" }), _jsx("h1", { children: "Saldo e upgrades" }), _jsx("p", { className: "hero-description", children: "Reforce seus cr\u00E9ditos para continuar usando todos os modelos integrados da NexusAI. Cada R$ 1,00 equivale a 100 cr\u00E9ditos." })] }), _jsxs("div", { className: "hero-actions", children: [_jsx("button", { className: "btn btn-secondary", onClick: () => navigate(-1), children: "\u2190 Voltar" }), _jsx("button", { className: "btn btn-primary", onClick: handleRefreshCredits, children: "Atualizar saldo" })] })] }), _jsxs("section", { className: "credit-summary", children: [_jsxs("div", { className: "credit-card", children: [_jsx("span", { className: "credit-label", children: "Saldo atual" }), _jsxs("div", { className: "credit-value", children: [formatCredits(credits), " ", _jsx("small", { children: "cr\u00E9ditos" })] }), _jsxs("p", { className: "credit-subtitle", children: ["Equivalente a ", formatBRL((credits ?? 0) / 100), " dispon\u00EDveis para uso."] })] }), _jsxs("div", { className: "credit-card", children: [_jsx("span", { className: "credit-label", children: "Como funciona?" }), _jsxs("ul", { className: "credit-list", children: [_jsx("li", { children: "1 cr\u00E9dito = R$ 0,01 (1 centavo)" }), _jsx("li", { children: "O d\u00E9bito acontece ap\u00F3s cada resposta da IA" }), _jsx("li", { children: "Pagamentos aprovados liberam os cr\u00E9ditos automaticamente" })] })] })] }), _jsx("section", { className: "pix-config", children: _jsxs("div", { children: [_jsx("label", { htmlFor: "pix-cpf", children: "CPF para pagamento via PIX" }), _jsx("input", { id: "pix-cpf", inputMode: "numeric", value: pixCpf, onChange: (e) => setPixCpf(e.target.value), placeholder: "Digite somente n\u00FAmeros" }), _jsx("small", { children: "Utilizaremos este CPF para gerar o QR Code e liberar seus cr\u00E9ditos." })] }) }), feedback && (_jsx("div", { className: `feedback-banner feedback-${feedback.type}`, role: "status", children: feedback.message })), error && (_jsx("div", { className: "feedback-banner feedback-error", role: "alert", children: error })), _jsx("section", { className: "plans-grid", children: isLoadingPlans ? (_jsx("div", { className: "plan-card", children: "Carregando planos..." })) : (plans.map((plan) => (_jsxs("article", { className: `plan-card ${plan.featured ? "plan-card--featured" : ""}`, children: [_jsxs("div", { className: "plan-header", children: [_jsx("h2", { children: plan.name }), _jsx("p", { children: plan.description })] }), _jsxs("div", { className: "plan-price", children: [_jsx("strong", { children: formatBRL(plan.price_brl) }), _jsxs("span", { children: [formatCredits(plan.credits), " cr\u00E9ditos"] })] }), _jsxs("ul", { className: "plan-benefits", children: [_jsxs("li", { children: ["Cr\u00E9ditos liberados: ", formatCredits(plan.credits)] }), _jsxs("li", { children: ["Valor proporcional: ", formatBRL(plan.credits / 100)] }), _jsx("li", { children: "Pagamento \u00FAnico via Mercado Pago" })] }), _jsxs("div", { className: "plan-actions", children: [_jsx("button", { className: "btn btn-primary", onClick: () => handleSubscribe(plan.id), disabled: actionPlanId === plan.id, children: actionPlanId === plan.id
                                        ? "Gerando link..."
                                        : `Checkout (${formatBRL(plan.price_brl)})` }), _jsx("button", { className: "btn btn-outline", onClick: () => handlePixSubscribe(plan.id), disabled: isPixLoading, children: isPixLoading ? "Gerando PIX..." : "Gerar PIX" })] })] }, plan.id)))) }), pixResult && (_jsxs("section", { className: "pix-result", children: [_jsxs("h3", { children: ["PIX gerado para ", pixResult.plan.name] }), _jsxs("p", { children: ["Valor: ", _jsx("strong", { children: formatBRL(pixResult.plan.price_brl) })] }), _jsxs("div", { className: "pix-result-content", children: [pixResult.payment.transaction_data.qr_code_base64 ? (_jsx("img", { src: `data:image/png;base64,${pixResult.payment.transaction_data.qr_code_base64}`, alt: "QR Code PIX" })) : (_jsx("p", { children: "Use o c\u00F3digo abaixo no seu banco:" })), _jsxs("div", { className: "pix-code-box", children: [_jsx("textarea", { readOnly: true, value: pixResult.payment.transaction_data.qr_code }), _jsx("button", { className: "btn btn-secondary", onClick: handleCopyPixCode, children: "Copiar c\u00F3digo PIX" }), copyFeedback && _jsx("small", { children: copyFeedback }), pixResult.payment.transaction_data.ticket_url && (_jsx("a", { className: "btn btn-link", href: pixResult.payment.transaction_data.ticket_url, target: "_blank", rel: "noreferrer", children: "Abrir guia do Mercado Pago" }))] })] }), _jsx("p", { className: "text-muted", children: "Ap\u00F3s confirmar o pagamento em seu banco, clique em \"Atualizar saldo\". A libera\u00E7\u00E3o ocorre automaticamente assim que o Mercado Pago aprova o PIX." })] }))] }));
};
export default SubscriptionsPage;
