import { useState, useEffect } from "react";
import { deploymentsList, deploymentsCreate } from "../api";

type Deployment = { id: string; name: string; status: string; workerId?: string; createdAt: string };

export default function Deployments() {
  const [list, setList] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await deploymentsList();
      setList(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await deploymentsCreate(name.trim());
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deploy");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Deploy model</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Simulated deployment: assigns a worker and marks the model as ready.
        </p>
        <form onSubmit={create}>
          <div className="form-row">
            <label htmlFor="modelName">Model name</label>
            <input
              id="modelName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. gpt-sim-v1"
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn" disabled={creating}>Deploy</button>
        </form>
      </div>
      <div className="card">
        <h2>Deployments</h2>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Worker</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={4}>No deployments yet.</td></tr>
                ) : (
                  list.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td><span className={d.status === "ready" ? "" : ""}>{d.status}</span></td>
                      <td>{d.workerId ?? "—"}</td>
                      <td>{new Date(d.createdAt).toLocaleString()}</td>
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
