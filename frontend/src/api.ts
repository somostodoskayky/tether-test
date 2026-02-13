const API_BASE = (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? "";

function getAuth(): string {
  return localStorage.getItem("gpu_cloud_api_key") ?? "";
}

export function setApiKey(key: string): void {
  localStorage.setItem("gpu_cloud_api_key", key);
}

export function clearApiKey(): void {
  localStorage.removeItem("gpu_cloud_api_key");
}

export function hasApiKey(): boolean {
  return !!getAuth();
}

function headers(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  const key = getAuth();
  if (key) (h as Record<string, string>)["Authorization"] = `Bearer ${key}`;
  return h;
}

async function handleRes<T>(r: Response): Promise<T> {
  const text = await r.text();
  let data: T & { error?: { message?: string } };
  try {
    data = JSON.parse(text) as T & { error?: { message?: string } };
  } catch {
    throw new Error(r.statusText || "Request failed");
  }
  if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
  return data as T;
}

export async function apiKeysList(): Promise<{ data: Array<{ id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string }> }> {
  const r = await fetch(`${API_BASE}/api/keys`, { headers: headers() });
  return handleRes(r);
}

export async function apiKeysCreate(name: string): Promise<{ data: { id: string; key: string; name: string; prefix: string; createdAt: string } }> {
  const r = await fetch(`${API_BASE}/api/keys`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name }),
  });
  return handleRes(r);
}

export async function apiKeysDelete(id: string): Promise<{ data: { deleted: boolean } }> {
  const r = await fetch(`${API_BASE}/api/keys/${id}`, { method: "DELETE", headers: headers() });
  return handleRes(r);
}

export async function usageSummary(keyId?: string, since?: string): Promise<{
  data: {
    summary: { totalRequests: number; totalPromptTokens: number; totalCompletionTokens: number; totalTokens: number };
  };
}> {
  const q = new URLSearchParams();
  if (keyId) q.set("keyId", keyId);
  if (since) q.set("since", since);
  const r = await fetch(`${API_BASE}/api/usage?${q}`, { headers: headers() });
  return handleRes(r);
}

export async function usageHistory(keyId?: string, since?: string, limit?: number): Promise<{
  data: { history: Array<{ keyId: string; timestamp: string; model: string; totalTokens: number }> };
}> {
  const q = new URLSearchParams();
  if (keyId) q.set("keyId", keyId);
  if (since) q.set("since", since);
  if (limit != null) q.set("limit", String(limit));
  const r = await fetch(`${API_BASE}/api/usage/history?${q}`, { headers: headers() });
  return handleRes(r);
}

export async function modelsList(): Promise<{
  data: Array<{ id: string; object: string; owned_by: string }>;
  deployments: Array<{ id: string; name: string; status: string; workerId?: string }>;
}> {
  const r = await fetch(`${API_BASE}/api/models`, { headers: headers() });
  return handleRes(r);
}

export async function deploymentsList(): Promise<{ data: Array<{ id: string; name: string; status: string; workerId?: string; createdAt: string }> }> {
  const r = await fetch(`${API_BASE}/api/deployments`, { headers: headers() });
  return handleRes(r);
}

export async function deploymentsCreate(name: string): Promise<{ data: { id: string; name: string; status: string; workerId?: string; createdAt: string } }> {
  const r = await fetch(`${API_BASE}/api/deployments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name }),
  });
  return handleRes(r);
}

export async function healthCheck(): Promise<{ status: string }> {
  const r = await fetch(`${API_BASE}/health`);
  return handleRes(r);
}

export async function metrics(): Promise<{ workers: number; queueDepth: number }> {
  const r = await fetch(`${API_BASE}/metrics`, { headers: headers() });
  return handleRes(r);
}
