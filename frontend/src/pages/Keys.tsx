import { useState, useEffect } from "react";
import { apiKeysList, apiKeysCreate, apiKeysDelete } from "../api";

type KeyRow = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string };

export default function Keys() {
  const [list, setList] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiKeysList();
      setList(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setError("");
    setNewKey(null);
    try {
      const res = await apiKeysCreate(createName.trim());
      setNewKey(res.data.key);
      setCreateName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this API key? It will stop working immediately.")) return;
    setError("");
    try {
      await apiKeysDelete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <>
      <div className="card">
        <h2>Create API key</h2>
        <form onSubmit={create}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Production"
            />
          </div>
          {newKey && (
            <div className="alert alert-success">
              Key created. Copy it now — it won’t be shown again: <code style={{ wordBreak: "break-all" }}>{newKey}</code>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn" disabled={creating}>Create</button>
        </form>
      </div>
      <div className="card">
        <h2>API keys</h2>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Prefix</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((k) => (
                  <tr key={k.id}>
                    <td>{k.name}</td>
                    <td><code>{k.prefix}…</code></td>
                    <td>{new Date(k.createdAt).toLocaleString()}</td>
                    <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}</td>
                    <td>
                      {k.id !== "admin" && (
                        <button type="button" className="btn btn-secondary btn-danger" onClick={() => remove(k.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
