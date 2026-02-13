import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usageSummary, metrics } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState<{ totalRequests: number; totalPromptTokens: number; totalCompletionTokens: number; totalTokens: number } | null>(null);
  const [workerMetrics, setWorkerMetrics] = useState<{ workers: number; queueDepth: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [u, m] = await Promise.all([usageSummary(), metrics()]);
        if (!cancelled) {
          setSummary(u.data.summary);
          setWorkerMetrics(m);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    }
    load();
    const t = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  return (
    <>
      <div className="card">
        <h2>Overview</h2>
        <div className="metrics-grid">
          <div className="metric">
            <div className="value">{summary?.totalRequests ?? "—"}</div>
            <div className="label">Total requests</div>
          </div>
          <div className="metric">
            <div className="value">{summary?.totalTokens ?? "—"}</div>
            <div className="label">Total tokens</div>
          </div>
          <div className="metric">
            <div className="value">{summary?.totalPromptTokens ?? "—"}</div>
            <div className="label">Prompt tokens</div>
          </div>
          <div className="metric">
            <div className="value">{summary?.totalCompletionTokens ?? "—"}</div>
            <div className="label">Completion tokens</div>
          </div>
          <div className="metric">
            <div className="value">{workerMetrics?.workers ?? "—"}</div>
            <div className="label">Workers</div>
          </div>
          <div className="metric">
            <div className="value">{workerMetrics?.queueDepth ?? "—"}</div>
            <div className="label">Queue depth</div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2>Quick links</h2>
        <p>Manage <Link to="/keys">API keys</Link>, view <Link to="/usage">usage</Link>, and <Link to="/deployments">deploy models</Link>.</p>
      </div>
    </>
  );
}
