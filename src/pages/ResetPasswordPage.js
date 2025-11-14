import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
    const tokenFromUrl = searchParams.get("token") ?? "";
    const [email, setEmail] = useState(initialEmail);
    const [token, setToken] = useState(tokenFromUrl);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim() || !token.trim()) {
            setError("Token e email são obrigatórios.");
            return;
        }
        if (password.length < 6) {
            setError("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (password !== confirmPassword) {
            setError("As senhas devem ser idênticas.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(null);
            await resetPassword({
                email: email.trim().toLowerCase(),
                token: token.trim(),
                password,
            });
            setSuccess("Senha atualizada com sucesso! Faça login novamente.");
            setTimeout(() => navigate("/login"), 2500);
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Não foi possível atualizar a senha. Solicite um novo link.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-layout", children: _jsxs("form", { className: "auth-card", onSubmit: handleSubmit, children: [_jsxs("div", { className: "auth-header", children: [_jsx("h1", { children: "Definir nova senha" }), _jsx("p", { children: "Copie o token recebido por email para confirmar sua identidade." })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "reset-email", children: "Email" }), _jsx("input", { id: "reset-email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), autoComplete: "email" })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "reset-token", children: "Token" }), _jsx("input", { id: "reset-token", value: token, onChange: (event) => setToken(event.target.value), placeholder: "Cole aqui o token enviado" })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "reset-password", children: "Nova senha" }), _jsx("input", { id: "reset-password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), autoComplete: "new-password", minLength: 6 })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "reset-confirm", children: "Confirmar senha" }), _jsx("input", { id: "reset-confirm", type: "password", value: confirmPassword, onChange: (event) => setConfirmPassword(event.target.value), autoComplete: "new-password", minLength: 6 })] }), success ? (_jsx("p", { className: "auth-success", role: "status", children: success })) : null, error ? (_jsx("p", { className: "auth-error", role: "alert", children: error })) : null, _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isLoading, children: isLoading ? "Atualizando..." : "Atualizar senha" }), _jsxs("div", { className: "auth-links", children: [_jsx(Link, { to: "/login", children: "Voltar para o login" }), _jsx(Link, { to: "/esqueci-senha", children: "Reenviar link" })] })] }) }));
};
export default ResetPasswordPage;
