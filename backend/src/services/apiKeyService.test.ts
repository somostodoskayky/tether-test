import { createApiKey, validateApiKey, listApiKeys, deleteApiKey } from "./apiKeyService.js";

describe("apiKeyService", () => {
  beforeEach(() => {
    const list = listApiKeys();
    list.forEach((k) => deleteApiKey(k.id));
  });

  it("creates a key and returns it once", () => {
    const { id, key, record } = createApiKey("test-key");
    expect(id).toBeTruthy();
    expect(key).toMatch(/^gpu_[a-f0-9]+$/);
    expect(record.name).toBe("test-key");
    expect(record.prefix).toBe(key.slice(0, 8));
  });

  it("validates correct key", () => {
    const { id, key } = createApiKey("test");
    const rec = validateApiKey(`Bearer ${key}`);
    expect(rec).not.toBeNull();
    expect(rec!.id).toBe(id);
  });

  it("rejects invalid or missing auth", () => {
    expect(validateApiKey(undefined)).toBeNull();
    expect(validateApiKey("Bearer invalid")).toBeNull();
    const { key } = createApiKey("test");
    expect(validateApiKey(`Bearer ${key}x`)).toBeNull();
  });

  it("lists and deletes keys", () => {
    createApiKey("a");
    createApiKey("b");
    const list = listApiKeys();
    expect(list.length).toBe(2);
    const ok = deleteApiKey(list[0].id);
    expect(ok).toBe(true);
    expect(listApiKeys().length).toBe(1);
    expect(validateApiKey(`Bearer ${createApiKey("x").key}`)).not.toBeNull();
    expect(deleteApiKey("nonexistent")).toBe(false);
  });
});
