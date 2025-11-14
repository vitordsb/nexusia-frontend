import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <h1>Criar conta</h1>
          <p>Conecte-se à NexusAI com suas credenciais sincronizadas.</p>
        </div>

        <div className="auth-form-group">
          <label htmlFor="username-input">Nome de usuário</label>
          <input
            id="username-input"
            placeholder="Seu nome ou apelido"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
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
          <label htmlFor="password-input">Senha / Chave API</label>
          <input
            id="password-input"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        {error ? (
          <p role="alert" className="auth-error">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar conta"}
        </button>

        <div className="auth-links">
          <span>Já possui uma conta?</span>
          <Link to="/login">Acesse o login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
