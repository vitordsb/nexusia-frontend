import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { fetchUserProfile } from "../api/auth";
import { fetchCreditHistory as fetchCreditHistoryApi, simulateCreditTopUp, } from "../api/credits";
const AuthContext = createContext(undefined);
const STORAGE_KEY = "nexusai-auth";
const MAX_HISTORY_ENTRIES = 60;
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const historySyncRef = useRef(null);
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            setIsReady(true);
            return;
        }
        try {
            const parsed = JSON.parse(stored);
            if (parsed?.token && parsed?.userId) {
                setAuth({
                    token: parsed.token,
                    userId: parsed.userId,
                    username: parsed.username ?? "",
                    email: parsed.email ?? "",
                    credits: typeof parsed.credits === "number" ? parsed.credits : 0,
                    creditHistory: sanitizeHistory(parsed.creditHistory),
                });
            }
            else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        catch {
            localStorage.removeItem(STORAGE_KEY);
        }
        setIsReady(true);
    }, []);
    const persistAuth = useCallback((payload) => {
        setAuth((current) => {
            const next = typeof payload === "function" ? payload(current) : payload;
            if (next) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            else {
                localStorage.removeItem(STORAGE_KEY);
            }
            return next;
        });
    }, []);
    const syncHistory = useCallback(async (userId) => {
        try {
            const history = await fetchCreditHistoryApi(userId, MAX_HISTORY_ENTRIES);
            persistAuth((current) => {
                if (!current || current.userId !== userId) {
                    return current;
                }
                return {
                    ...current,
                    creditHistory: sanitizeHistory(history),
                };
            });
        }
        catch (error) {
            console.error("Não foi possível carregar o histórico de créditos:", error);
        }
    }, [persistAuth]);
    const setAuthData = useCallback((data) => {
        const normalized = {
            token: data.token,
            userId: data.userId,
            username: data.username,
            email: data.email,
            credits: Number.isFinite(data.credits) ? Math.max(0, data.credits) : 0,
            creditHistory: sanitizeHistory(data.creditHistory),
        };
        historySyncRef.current = normalized.userId;
        persistAuth(normalized);
        void syncHistory(normalized.userId);
    }, [persistAuth, syncHistory]);
    const logout = useCallback(() => {
        persistAuth(null);
    }, [persistAuth]);
    const refreshCredits = useCallback(async () => {
        if (!auth?.userId)
            return;
        try {
            const [profile, history] = await Promise.all([
                fetchUserProfile(auth.userId),
                fetchCreditHistoryApi(auth.userId, MAX_HISTORY_ENTRIES),
            ]);
            persistAuth((current) => {
                if (!current || current.userId !== auth.userId) {
                    return current;
                }
                return {
                    ...current,
                    username: profile.username,
                    email: profile.email,
                    credits: profile.credits ?? 0,
                    creditHistory: sanitizeHistory(history),
                };
            });
        }
        catch (error) {
            console.error("Erro ao atualizar o saldo do usuário:", error);
        }
    }, [auth?.userId, persistAuth]);
    const topUpCredits = useCallback(async (amount, note) => {
        if (!auth?.userId) {
            throw new Error("Usuário não autenticado");
        }
        const response = await simulateCreditTopUp(auth.userId, { amount, note });
        persistAuth((current) => {
            if (!current || current.userId !== auth.userId) {
                return current;
            }
            const normalized = response.transaction
                ? sanitizeHistory([response.transaction])
                : [];
            const history = normalized.length
                ? [normalized[0], ...(current.creditHistory ?? [])]
                : current.creditHistory ?? [];
            return {
                ...current,
                credits: response.credits ?? current.credits,
                creditHistory: history.slice(0, MAX_HISTORY_ENTRIES),
            };
        });
    }, [auth?.userId, persistAuth]);
    const creditUsage = useMemo(() => computeUsage(auth?.creditHistory ?? []), [auth?.creditHistory]);
    useEffect(() => {
        if (!auth?.userId || !isReady)
            return;
        if (historySyncRef.current === auth.userId)
            return;
        historySyncRef.current = auth.userId;
        void syncHistory(auth.userId);
    }, [auth?.userId, isReady, syncHistory]);
    const value = useMemo(() => ({
        token: auth?.token ?? null,
        userId: auth?.userId ?? null,
        username: auth?.username ?? null,
        email: auth?.email ?? null,
        credits: auth?.credits ?? null,
        creditUsage,
        creditHistory: auth?.creditHistory ?? [],
        isReady,
        setAuthData,
        refreshCredits,
        topUpCredits,
        logout,
    }), [auth, creditUsage, isReady, refreshCredits, setAuthData, topUpCredits, logout]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }
    return context;
};
function sanitizeHistory(history) {
    if (!Array.isArray(history))
        return [];
    return history
        .filter((entry) => Boolean(entry && entry.userId && entry.createdAt))
        .map((entry) => ({
        ...entry,
        id: entry.id ?? `${entry.userId}-${entry.createdAt}`,
        amount: Math.max(0, Number(entry.amount) || 0),
        balanceAfter: Number(entry.balanceAfter ?? 0),
        createdAt: entry.createdAt ?? new Date().toISOString(),
        direction: entry.direction === "debit" ? "debit" : "credit",
        metadata: entry.metadata ?? null,
        reference: entry.reference ?? null,
        reason: entry.reason ?? null,
    }))
        .slice(0, MAX_HISTORY_ENTRIES);
}
function computeUsage(history) {
    return history.reduce((acc, entry) => {
        if (entry.direction !== "debit") {
            return acc;
        }
        const metadata = entry.metadata ?? {};
        const model = (typeof metadata === "object" && metadata && "model" in metadata
            ? String(metadata.model)
            : undefined) || "modelo-desconhecido";
        acc[model] = (acc[model] ?? 0) + entry.amount;
        return acc;
    }, {});
}
