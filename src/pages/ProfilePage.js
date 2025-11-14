import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getModelDisplayName } from "../utils/credits";
const quickTopUps = [50, 100, 250, 500];
const formatCredits = (value) => new Intl.NumberFormat("pt-BR").format(value ?? 0);
const formatDateTime = (value) => {
    try {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(value));
    }
    catch {
        return value;
    }
};
const ProfilePage = () => {
    const { username, email, userId, credits, creditUsage, creditHistory, topUpCredits, } = useAuth();
    const [customAmount, setCustomAmount] = useState("100");
    const [feedback, setFeedback] = useState(null);
    const navigate = useNavigate();
    const preferredName = username?.trim() || email || "Usuário Nexus";
    const usageEntries = useMemo(() => Object.entries(creditUsage ?? {}).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)), [creditUsage]);
    const totalUsed = useMemo(() => usageEntries.reduce((sum, [, value]) => sum + (value ?? 0), 0), [usageEntries]);
    const latestHistory = creditHistory.slice(0, 6);
    const handleQuickAdd = (amount) => {
        void handleAddCredits(amount, `Recarga rápida (${amount} créditos)`);
    };
    const handleAddCredits = async (amount, note) => {
        if (!Number.isFinite(amount) || amount <= 0) {
            setFeedback("Informe um valor maior que zero para adicionar créditos.");
            return;
        }
        try {
            await topUpCredits(Math.round(amount), note ?? "Recarga simulada");
            setFeedback(`Adicionamos ${formatCredits(amount)} créditos ao seu saldo.`);
        }
        catch (error) {
            setFeedback(error instanceof Error
                ? error.message
                : "Não foi possível adicionar créditos agora.");
        }
        finally {
            setTimeout(() => setFeedback(null), 4000);
        }
    };
    const handleCustomSubmit = async (event) => {
        event.preventDefault();
        const numericValue = Number(customAmount);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            setFeedback("Use apenas números positivos para recarregar.");
            return;
        }
        await handleAddCredits(numericValue, "Recarga personalizada");
        setCustomAmount("");
    };
    return (_jsxs("div", { className: "profile-page", children: [_jsxs("header", { className: "profile-hero", children: [_jsxs("div", { className: "profile-hero-info", children: [_jsx("p", { className: "hero-label", children: "Central do cliente" }), _jsxs("h1", { children: ["Ol\u00E1, ", preferredName] }), _jsx("p", { className: "hero-description", children: "Simule recargas locais para testar fluxos com GPT e acompanhe o consumo de cr\u00E9ditos por IA. Nenhum dado financeiro real \u00E9 enviado." }), _jsxs("div", { className: "profile-hero-tags", children: [_jsxs("span", { className: "profile-tag", children: ["ID: ", userId ?? "não encontrado"] }), _jsxs("span", { className: "profile-tag", children: ["Email: ", email ?? "não informado"] })] })] }), _jsxs("div", { className: "profile-balance-card", children: [_jsx("span", { className: "profile-balance-label", children: "Saldo dispon\u00EDvel" }), _jsxs("strong", { className: "profile-balance-value", children: [formatCredits(credits), " ", _jsx("small", { children: "cr\u00E9ditos" })] }), _jsxs("p", { className: "profile-balance-sub", children: ["Total consumido nesta sess\u00E3o: ", formatCredits(totalUsed), " cr\u00E9ditos"] }), _jsx("div", { className: "profile-balance-actions", children: _jsx("button", { className: "btn btn-primary", onClick: () => navigate(-1), children: "\u2190 Voltar" }) })] })] }), _jsxs("section", { className: "profile-grid", children: [_jsxs("div", { className: "panel profile-card", children: [_jsxs("div", { className: "profile-card-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Simular entrada de cr\u00E9ditos" }), _jsx("p", { children: "Adicione cr\u00E9ditos fict\u00EDcios para liberar o uso dos modelos GPT." })] }), _jsx("span", { className: "profile-chip", children: "Modo simulado" })] }), _jsxs("form", { className: "credit-form", onSubmit: handleCustomSubmit, children: [_jsx("label", { htmlFor: "custom-credit", children: "Valor personalizado" }), _jsxs("div", { className: "credit-input-row", children: [_jsx("input", { id: "custom-credit", type: "number", min: 1, placeholder: "Ex.: 150", value: customAmount, onChange: (event) => setCustomAmount(event.target.value) }), _jsx("button", { type: "submit", className: "btn btn-primary", children: "Adicionar" })] })] }), _jsxs("div", { className: "quick-add", children: [_jsx("span", { children: "Ou selecione um valor r\u00E1pido:" }), _jsx("div", { className: "quick-add-buttons", children: quickTopUps.map((amount) => (_jsxs("button", { type: "button", className: "quick-add-button", onClick: () => handleQuickAdd(amount), children: ["+", formatCredits(amount)] }, amount))) })] }), feedback ? (_jsx("p", { role: "status", className: "profile-feedback", children: feedback })) : (_jsx("p", { className: "profile-hint", children: "Os cr\u00E9ditos simulados ficam associados \u00E0 sua conta e servem apenas para testes internos. Nenhum pagamento real \u00E9 processado." }))] }), _jsxs("div", { className: "panel profile-card", children: [_jsx("div", { className: "profile-card-header", children: _jsxs("div", { children: [_jsx("h2", { children: "Consumo por IA" }), _jsx("p", { children: "Totais acumulados desde o \u00FAltimo login." })] }) }), usageEntries.length ? (_jsxs("table", { className: "usage-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Modelo" }), _jsx("th", { children: "Cr\u00E9ditos usados" }), _jsx("th", { children: "Participa\u00E7\u00E3o" })] }) }), _jsx("tbody", { children: usageEntries.map(([model, value]) => {
                                            const percent = totalUsed
                                                ? `${((value / totalUsed) * 100).toFixed(1)}%`
                                                : "—";
                                            return (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "usage-model", children: [_jsx("strong", { children: getModelDisplayName(model) }), _jsx("span", { children: model })] }) }), _jsx("td", { children: formatCredits(value) }), _jsx("td", { children: percent })] }, model));
                                        }) })] })) : (_jsx("p", { className: "profile-hint", children: "Ainda n\u00E3o h\u00E1 consumo registrado nesta conta." }))] })] }), _jsxs("section", { className: "panel profile-history", children: [_jsx("div", { className: "profile-card-header", children: _jsxs("div", { children: [_jsx("h2", { children: "Hist\u00F3rico de movimentos" }), _jsx("p", { children: "\u00DAltimas recargas e d\u00E9bitos simulados." })] }) }), latestHistory.length ? (_jsx("ul", { className: "history-list", children: latestHistory.map((entry) => {
                            const metadata = entry.metadata && typeof entry.metadata === "object"
                                ? entry.metadata
                                : null;
                            const modelName = metadata && "model" in metadata
                                ? getModelDisplayName(String(metadata.model))
                                : getModelDisplayName("IA");
                            const conversationId = metadata && "conversation_id" in metadata
                                ? String(metadata.conversation_id)
                                : "—";
                            const note = metadata && "note" in metadata
                                ? String(metadata.note)
                                : "Recarga registrada";
                            const isCredit = entry.direction === "credit";
                            return (_jsxs("li", { className: "history-item", children: [_jsx("div", { className: `history-icon ${isCredit ? "topup" : "usage"}`, children: isCredit ? "⬆" : "⬇" }), _jsxs("div", { className: "history-content", children: [_jsx("strong", { children: isCredit ? note : modelName }), _jsxs("span", { children: [formatDateTime(entry.createdAt), " \u00B7", " ", isCredit ? "Saldo adicionado" : `Conversa ${conversationId}`] })] }), _jsxs("span", { className: `history-amount ${isCredit ? "topup" : "usage"}`, children: [isCredit ? "+" : "-", " ", formatCredits(entry.amount)] })] }, entry.id));
                        }) })) : (_jsx("p", { className: "profile-hint", children: "Nada por aqui ainda. Conduza uma conversa para gerar consumo e veja as movimenta\u00E7\u00F5es aparecerem." }))] })] }));
};
export default ProfilePage;
