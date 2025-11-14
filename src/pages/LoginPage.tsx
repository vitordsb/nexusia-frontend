
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithCredentials, requestAccessToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
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
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b, #0f172a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, sans-serif",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(30, 41, 59, 0.9)",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          padding: "2rem",
          color: "white",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            textAlign: "center",
            color: "#60a5fa",
          }}
        >
          Nexus<span style={{ color: "#fff" }}>AI</span> Login
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            textAlign: "center",
            color: "#cbd5e1",
            marginBottom: "2rem",
          }}
        >
          Entre com seu email e senha vinculada à sua chave API da NexusAI.
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email-input" style={{ fontSize: "0.9rem" }}>
            Email
          </label>
          <input
            id="email-input"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              width: "100%",
              marginTop: "0.3rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white",
              outline: "none",
              fontSize: "0.95rem",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #60a5fa")}
            onBlur={(e) => (e.target.style.border = "1px solid #334155")}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password-input" style={{ fontSize: "0.9rem" }}>
            Senha / Chave API
          </label>
          <input
            id="password-input"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: "100%",
              marginTop: "0.3rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white",
              outline: "none",
              fontSize: "0.95rem",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #60a5fa")}
            onBlur={(e) => (e.target.style.border = "1px solid #334155")}
          />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              marginTop: "0.5rem",
              color: "#f87171",
              fontSize: "0.9rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            background: isLoading ? "#475569" : "#3b82f6",
            color: "white",
            fontWeight: 600,
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            transition: "background 0.3s ease, transform 0.1s ease",
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.background = "#2563eb";
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.background = "#3b82f6";
          }}
          onMouseDown={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#cbd5e1",
          }}
        >
          Ainda não possui conta?{" "}
          <Link
            to="/register"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: 500,
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Crie agora
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
