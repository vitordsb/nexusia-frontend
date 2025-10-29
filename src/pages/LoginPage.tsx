import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="panel"
        style={{
          width: "min(420px, 100%)",
          backgroundColor: "rgba(15, 23, 42, 0.85)"
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: "1.8rem" }}>NexusAI Chat</h1>
        <p className="text-muted" style={{ marginTop: "0.5rem" }}>
          Forneça um <code>user_id</code> para gerar um token de desenvolvimento internamente.
        </p>
        <div className="form-group" style={{ marginTop: "1.5rem" }}>
          <label htmlFor="user-id-input">user_id</label>
          <input
            id="user-id-input"
            placeholder="ex.: user-123"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </div>
        {error ? (
          <p role="alert" className="text-muted" style={{ marginTop: "0.75rem" }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: "1.5rem", width: "100%" }}
          disabled={isLoading}
        >
          {isLoading ? "Gerando token..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
