import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";
const LoginPage = () => {
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setAuthData } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!userId.trim()) {
            setError("Informe um user_id válido.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const token = await generateToken(userId.trim());
            setAuthData({ token, userId: userId.trim() });
            navigate("/", { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao gerar token");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { style: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }, children: _jsxs("form", { onSubmit: handleSubmit, className: "panel", style: {
                width: "min(420px, 100%)",
                backgroundColor: "rgba(15, 23, 42, 0.85)"
            }, children: [_jsx("h1", { style: { marginTop: 0, fontSize: "1.8rem" }, children: "NexusAI Chat" }), _jsxs("p", { className: "text-muted", style: { marginTop: "0.5rem" }, children: ["Forne\u00E7a um ", _jsx("code", { children: "user_id" }), " para gerar um token de desenvolvimento internamente."] }), _jsxs("div", { className: "form-group", style: { marginTop: "1.5rem" }, children: [_jsx("label", { htmlFor: "user-id-input", children: "user_id" }), _jsx("input", { id: "user-id-input", placeholder: "ex.: user-123", value: userId, onChange: (event) => setUserId(event.target.value) })] }), error ? (_jsx("p", { role: "alert", className: "text-muted", style: { marginTop: "0.75rem" }, children: error })) : null, _jsx("button", { type: "submit", className: "btn btn-primary", style: { marginTop: "1.5rem", width: "100%" }, disabled: isLoading, children: isLoading ? "Gerando token..." : "Entrar" })] }) }));
};
export default LoginPage;
