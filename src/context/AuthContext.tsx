import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchUserProfile } from "../api/auth";
import {
  fetchCreditHistory as fetchCreditHistoryApi,
  simulateCreditTopUp,
  type CreditHistoryEntry as ApiCreditHistoryEntry,
} from "../api/credits";

export type CreditHistoryEntry = ApiCreditHistoryEntry;

type CreditUsageMap = Record<string, number>;

type AuthData = {
  token: string;
  userId: string;
  username: string;
  email: string;
  credits: number;
  creditHistory: CreditHistoryEntry[];
};

type AuthDataInput = Omit<AuthData, "creditHistory"> & {
  creditHistory?: CreditHistoryEntry[];
};

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  credits: number | null;
  creditUsage: CreditUsageMap;
  creditHistory: CreditHistoryEntry[];
  isReady: boolean;
  setAuthData: (data: AuthDataInput) => void;
  refreshCredits: () => Promise<void>;
  topUpCredits: (amount: number, note?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "nexusai-auth";
const MAX_HISTORY_ENTRIES = 60;

type PersistPayload =
  | AuthData
  | null
  | ((current: AuthData | null) => AuthData | null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const historySyncRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsReady(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as Partial<AuthData>;
      if (parsed?.token && parsed?.userId) {
        setAuth({
          token: parsed.token,
          userId: parsed.userId,
          username: parsed.username ?? "",
          email: parsed.email ?? "",
          credits: typeof parsed.credits === "number" ? parsed.credits : 0,
          creditHistory: sanitizeHistory(parsed.creditHistory),
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsReady(true);
  }, []);

  const persistAuth = useCallback((payload: PersistPayload) => {
    setAuth((current) => {
      const next = typeof payload === "function" ? payload(current) : payload;
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return next;
    });
  }, []);

  const syncHistory = useCallback(
    async (userId: string) => {
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
      } catch (error) {
        console.error("Não foi possível carregar o histórico de créditos:", error);
      }
    },
    [persistAuth],
  );

  const setAuthData = useCallback(
    (data: AuthDataInput) => {
      const normalized: AuthData = {
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
    },
    [persistAuth, syncHistory],
  );

  const logout = useCallback(() => {
    persistAuth(null);
  }, [persistAuth]);

  const refreshCredits = useCallback(async () => {
    if (!auth?.userId) return;
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
    } catch (error) {
      console.error("Erro ao atualizar o saldo do usuário:", error);
    }
  }, [auth?.userId, persistAuth]);

  const topUpCredits = useCallback(
    async (amount: number, note?: string) => {
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
    },
    [auth?.userId, persistAuth],
  );

  const creditUsage = useMemo(
    () => computeUsage(auth?.creditHistory ?? []),
    [auth?.creditHistory],
  );

  useEffect(() => {
    if (!auth?.userId || !isReady) return;
    if (historySyncRef.current === auth.userId) return;
    historySyncRef.current = auth.userId;
    void syncHistory(auth.userId);
  }, [auth?.userId, isReady, syncHistory]);

  const value = useMemo(
    () => ({
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
    }),
    [auth, creditUsage, isReady, refreshCredits, setAuthData, topUpCredits, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};

function sanitizeHistory(history?: CreditHistoryEntry[]): CreditHistoryEntry[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry): entry is CreditHistoryEntry => Boolean(entry && entry.userId && entry.createdAt))
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

function computeUsage(history: CreditHistoryEntry[]): CreditUsageMap {
  return history.reduce<CreditUsageMap>((acc, entry) => {
    if (entry.direction !== "debit") {
      return acc;
    }
    const metadata = entry.metadata ?? {};
    const model =
      (typeof metadata === "object" && metadata && "model" in metadata
        ? String(metadata.model)
        : undefined) || "modelo-desconhecido";
    acc[model] = (acc[model] ?? 0) + entry.amount;
    return acc;
  }, {});
}
