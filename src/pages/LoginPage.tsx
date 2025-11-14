
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
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <h1>NexusAI</h1>
          <p>Acesse a plataforma segura integrada com suas chaves de API.</p>
        </div>

        <div className="auth-form-group">
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          <div className="auth-label-row">
            <label htmlFor="password-input">Senha / Chave API</label>
            <Link to="/esqueci-senha" className="auth-link">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="password-input"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <div className="auth-links">
          <span>Não tem conta?</span>
          <Link to="/register">Criar conta</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
