import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!username.trim() || !email.trim() || !password) {
            setError("Informe nome de usuário, email e senha para criar a conta.");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const normalizedEmail = email.trim().toLowerCase();
            const trimmedUsername = username.trim();
            await registerUser({
                email: normalizedEmail,
                username: trimmedUsername,
                password,
            });
            navigate("/", { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-layout", children: _jsxs("form", { className: "auth-card", onSubmit: handleSubmit, children: [_jsxs("div", { className: "auth-header", children: [_jsx("h1", { children: "Criar conta" }), _jsx("p", { children: "Conecte-se \u00E0 NexusAI com suas credenciais sincronizadas." })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "username-input", children: "Nome de usu\u00E1rio" }), _jsx("input", { id: "username-input", placeholder: "Seu nome ou apelido", value: username, onChange: (e) => setUsername(e.target.value), autoComplete: "username" })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "email-input", children: "Email" }), _jsx("input", { id: "email-input", type: "email", placeholder: "seu@email.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email" })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "password-input", children: "Senha / Chave API" }), _jsx("input", { id: "password-input", type: "password", placeholder: "******", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password", minLength: 6 })] }), error ? (_jsx("p", { role: "alert", className: "auth-error", children: error })) : null, _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isLoading, children: isLoading ? "Criando..." : "Criar conta" }), _jsxs("div", { className: "auth-links", children: [_jsx("span", { children: "J\u00E1 possui uma conta?" }), _jsx(Link, { to: "/login", children: "Acesse o login" })] })] }) }));
};
export default RegisterPage;
