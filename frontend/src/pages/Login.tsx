import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setApiKey, apiKeysList } from "../api";

export default function Login() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!key.trim()) {
      setError("Enter your API key or admin key.");
      return;
    }
    setLoading(true);
    try {
      setApiKey(key.trim());
      await apiKeysList();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid key or server unreachable.");
      setApiKey("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-box">
      <h1>GPU Cloud Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        Use your API key or the admin key from .env to sign in.
      </p>
      <form onSubmit={submit}>
        <div className="form-row">
          <label htmlFor="key">API Key</label>
          <input
            id="key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gpu_... or admin key"
            autoFocus
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
