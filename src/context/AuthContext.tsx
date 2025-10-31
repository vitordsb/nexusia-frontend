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
};

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
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
      const parsed = JSON.parse(stored) as AuthData;
      if (parsed?.token && parsed?.userId) {
        setAuth(parsed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setAuthData = useCallback((data: AuthData) => {
    setAuth(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
