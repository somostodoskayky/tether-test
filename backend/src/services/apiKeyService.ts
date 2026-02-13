/**
 * API key management: create, list, delete, validate.
 * Uses in-memory store; in production would use a database.
 */

import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";
import type { ApiKeyRecord } from "../types.js";

const keys = new Map<string, ApiKeyRecord>();
const hashToId = new Map<string, string>();

function hashKey(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

function toPrefix(secret: string): string {
  return secret.slice(0, 8);
}

export function createApiKey(name: string): { id: string; key: string; record: ApiKeyRecord } {
  const raw = `gpu_${randomBytes(24).toString("hex")}`;
  const id = uuidv4();
  const keyHash = hashKey(raw);
  const prefix = toPrefix(raw);
  const record: ApiKeyRecord = {
    id,
    name,
    keyHash,
    prefix,
    createdAt: new Date().toISOString(),
  };
  keys.set(id, record);
  hashToId.set(keyHash, id);
  return { id, key: raw, record };
}

export function listApiKeys(): ApiKeyRecord[] {
  return Array.from(keys.values());
}

export function deleteApiKey(id: string): boolean {
  const rec = keys.get(id);
  if (!rec) return false;
  hashToId.delete(rec.keyHash);
  keys.delete(id);
  return true;
}

export function validateApiKey(authHeader: string | undefined): ApiKeyRecord | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (config.adminKey && raw === config.adminKey) {
    return { id: "admin", name: "Admin", keyHash: "", prefix: "admin", createdAt: "" };
  }
  if (!raw.startsWith("gpu_")) return null;
  const hash = hashKey(raw);
  const id = hashToId.get(hash);
  if (!id) return null;
  const record = keys.get(id);
  if (!record) return null;
  try {
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(record.keyHash, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return record;
}

export function recordKeyUsage(keyId: string): void {
  const rec = keys.get(keyId);
  if (rec) rec.lastUsedAt = new Date().toISOString();
}

export function getKeyById(id: string): ApiKeyRecord | undefined {
  return keys.get(id);
}
