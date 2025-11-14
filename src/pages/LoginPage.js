import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithCredentials, requestAccessToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";
const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setAuthData } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim() || !password) {
            setError("Informe email e senha para entrar.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const user = await loginWithCredentials(email.trim().toLowerCase(), password);
            const token = await requestAccessToken(user.id);
            setAuthData({
                token,
                userId: user.id,
                username: user.username,
                email: user.email,
                credits: user.credits ?? 0,
                creditUsage: {},
                creditHistory: [],
            });
            navigate("/", { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao autenticar usuário");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-layout", children: _jsxs("form", { className: "auth-card", onSubmit: handleSubmit, children: [_jsxs("div", { className: "auth-header", children: [_jsx("h1", { children: "NexusAI" }), _jsx("p", { children: "Acesse a plataforma segura integrada com suas chaves de API." })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "email-input", children: "Email" }), _jsx("input", { id: "email-input", type: "email", placeholder: "seu@email.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email" })] }), _jsxs("div", { className: "auth-form-group", children: [_jsxs("div", { className: "auth-label-row", children: [_jsx("label", { htmlFor: "password-input", children: "Senha" }), _jsx(Link, { to: "/esqueci-senha", className: "auth-link", children: "Esqueci minha senha" })] }), _jsx("input", { id: "password-input", type: "password", placeholder: "******", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password" })] }), error && (_jsx("p", { role: "alert", className: "auth-error", children: error })), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isLoading, children: isLoading ? "Entrando..." : "Entrar" }), _jsxs("div", { className: "auth-links", children: [_jsx("span", { children: "N\u00E3o tem conta?" }), _jsx(Link, { to: "/register", children: "Criar conta" })] })] }) }));
};
export default LoginPage;
