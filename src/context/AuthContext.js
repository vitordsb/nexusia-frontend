import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(undefined);
const STORAGE_KEY = "nexusai-auth";
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setToken(parsed.token);
                setUserId(parsed.userId);
            }
            catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);
    const setAuthData = useCallback((data) => {
        setToken(data.token);
        setUserId(data.userId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, []);
    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);
    const value = useMemo(() => ({ token, userId, setAuthData, logout }), [token, userId, setAuthData, logout]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }
    return context;
};
