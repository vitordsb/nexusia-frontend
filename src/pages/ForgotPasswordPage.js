import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";
const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [debugLink, setDebugLink] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim()) {
            setError("Informe o email utilizado no cadastro.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const result = await requestPasswordReset(email.trim().toLowerCase());
            setStatus("success");
            setDebugLink(result.resetUrl ?? null);
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Não foi possível enviar as instruções de redefinição.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-layout", children: _jsxs("form", { className: "auth-card", onSubmit: handleSubmit, children: [_jsxs("div", { className: "auth-header", children: [_jsx("h1", { children: "Redefinir senha" }), _jsx("p", { children: "Informe o email cadastrado e enviaremos um link para redefinir sua senha." })] }), _jsxs("div", { className: "auth-form-group", children: [_jsx("label", { htmlFor: "forgot-email", children: "Email cadastrado" }), _jsx("input", { id: "forgot-email", type: "email", placeholder: "voce@email.com", value: email, onChange: (event) => setEmail(event.target.value), autoComplete: "email" })] }), status === "success" ? (_jsxs("div", { className: "auth-success", role: "status", children: [_jsx("p", { style: { margin: 0 }, children: "Se o email estiver cadastrado, enviaremos as instru\u00E7\u00F5es em instantes. Verifique a caixa de entrada e o spam." }), debugLink ? (_jsxs("div", { style: { marginTop: "0.7rem", wordBreak: "break-all" }, children: [_jsx("small", { children: "Ambiente em modo desenvolvimento \u2013 link direto:\u00A0" }), _jsx("a", { href: debugLink, style: { color: "#fff" }, children: debugLink })] })) : null] })) : null, error ? (_jsx("p", { className: "auth-error", role: "alert", children: error })) : null, _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isLoading, children: isLoading ? "Enviando..." : "Enviar instruções" }), _jsxs("div", { className: "auth-links", children: [_jsx(Link, { to: "/login", children: "Voltar para o login" }), _jsx(Link, { to: "/register", children: "Criar conta" })] })] }) }));
};
export default ForgotPasswordPage;
