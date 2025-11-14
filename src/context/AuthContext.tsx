import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type AuthData = {
  token: string;
  userId: string;
  username: string;
  email: string;
  credits: number;
};

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  credits: number | null;
  setAuthData: (data: AuthData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "nexusai-auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
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
          credits: typeof parsed.credits === "number" ? parsed.credits : 0
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setAuthData = useCallback((data: AuthData) => {
    const normalized: AuthData = {
      token: data.token,
      userId: data.userId,
      username: data.username,
      email: data.email,
      credits: Number.isFinite(data.credits) ? data.credits : 0
    };
    setAuth(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      userId: auth?.userId ?? null,
      username: auth?.username ?? null,
      email: auth?.email ?? null,
      credits: auth?.credits ?? null,
      setAuthData,
      logout
    }),
    [auth, setAuthData, logout]
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
