import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams]
  );
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a senha. Solicite um novo link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <h1>Definir nova senha</h1>
          <p>Copie o token recebido por email para confirmar sua identidade.</p>
        </div>

        <div className="auth-form-group">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="reset-token">Token</label>
          <input
            id="reset-token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Cole aqui o token enviado"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="reset-password">Nova senha</label>
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="reset-confirm">Confirmar senha</label>
          <input
            id="reset-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        {success ? (
          <p className="auth-success" role="status">
            {success}
          </p>
        ) : null}

        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Atualizando..." : "Atualizar senha"}
        </button>

        <div className="auth-links">
          <Link to="/login">Voltar para o login</Link>
          <Link to="/esqueci-senha">Reenviar link</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
