import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar as instruções de redefinição."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <h1>Redefinir senha</h1>
          <p>
            Informe o email cadastrado e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="auth-form-group">
          <label htmlFor="forgot-email">Email cadastrado</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>

        {status === "success" ? (
          <div className="auth-success" role="status">
            <p style={{ margin: 0 }}>
              Se o email estiver cadastrado, enviaremos as instruções em instantes.
              Verifique a caixa de entrada e o spam.
            </p>
            {debugLink ? (
              <div style={{ marginTop: "0.7rem", wordBreak: "break-all" }}>
                <small>
                  Ambiente em modo desenvolvimento – link direto:&nbsp;
                </small>
                <a href={debugLink} style={{ color: "#fff" }}>
                  {debugLink}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar instruções"}
        </button>

        <div className="auth-links">
          <Link to="/login">Voltar para o login</Link>
          <Link to="/register">Criar conta</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
