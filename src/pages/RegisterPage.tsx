
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginWithCredentials,
  registerUser,
  requestAccessToken,
} from "../api/auth";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
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
          maxWidth: "480px",
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
          Criar conta
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            textAlign: "center",
            color: "#cbd5e1",
            marginBottom: "2rem",
          }}
        >
          Sua senha será sincronizada com a chave API utilizada na NexusAI para gerar
          conversas.
        </p>

        {/* Nome de usuário */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username-input" style={{ fontSize: "0.9rem" }}>
            Nome de usuário
          </label>
          <input
            id="username-input"
            placeholder="Seu nome completo ou apelido"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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

        {/* Email */}
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

        {/* Senha */}
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
            autoComplete="new-password"
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

        {/* Erros */}
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

        {/* Botão */}
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
          {isLoading ? "Criando conta..." : "Criar conta"}
        </button>

        {/* Link para login */}
        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#cbd5e1",
          }}
        >
          Já possui uma conta?{" "}
          <Link
            to="/login"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: 500,
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Faça login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;

