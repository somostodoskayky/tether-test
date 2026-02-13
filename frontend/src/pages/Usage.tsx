import { useState, useEffect } from "react";
import { usageSummary, usageHistory } from "../api";

export default function Usage() {
  const [summary, setSummary] = useState<{ totalRequests: number; totalPromptTokens: number; totalCompletionTokens: number; totalTokens: number } | null>(null);
  const [history, setHistory] = useState<Array<{ keyId: string; timestamp: string; model: string; totalTokens: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [s, h] = await Promise.all([usageSummary(), usageHistory(undefined, undefined, 50)]);
        if (!cancelled) {
          setSummary(s.data.summary);
          setHistory(h.data.history);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  return (
    <>
      <div className="card">
        <h2>Usage summary</h2>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : summary ? (
          <div className="metrics-grid">
            <div className="metric">
              <div className="value">{summary.totalRequests}</div>
              <div className="label">Requests</div>
            </div>
            <div className="metric">
              <div className="value">{summary.totalTokens}</div>
              <div className="label">Total tokens</div>
            </div>
            <div className="metric">
              <div className="value">{summary.totalPromptTokens}</div>
              <div className="label">Prompt tokens</div>
            </div>
            <div className="metric">
              <div className="value">{summary.totalCompletionTokens}</div>
              <div className="label">Completion tokens</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="card">
        <h2>Recent usage</h2>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Key ID</th>
                  <th>Model</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4}>No usage yet.</td></tr>
                ) : (
                  history.map((r, i) => (
                    <tr key={i}>
                      <td>{new Date(r.timestamp).toLocaleString()}</td>
                      <td><code>{r.keyId.slice(0, 8)}…</code></td>
                      <td>{r.model}</td>
                      <td>{r.totalTokens}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
