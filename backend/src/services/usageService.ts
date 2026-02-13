/**
 * Usage tracking for inference requests (tokens, requests per key).
 * In-memory store; production would use a time-series DB or analytics store.
 */

import type { UsageRecord } from "../types.js";

const usageLog: UsageRecord[] = [];
const MAX_LOG = 100_000;

export function recordUsage(record: Omit<UsageRecord, "timestamp">): void {
  usageLog.push({
    ...record,
    timestamp: new Date().toISOString(),
  });
  if (usageLog.length > MAX_LOG) usageLog.splice(0, usageLog.length - MAX_LOG);
}

export function getUsageByKeyId(keyId: string, since?: string): UsageRecord[] {
  let list = usageLog.filter((u) => u.keyId === keyId);
  if (since) {
    const t = new Date(since).getTime();
    list = list.filter((u) => new Date(u.timestamp).getTime() >= t);
  }
  return list;
}

export function getAllUsage(since?: string, limit = 500): UsageRecord[] {
  let list = usageLog;
  if (since) {
    const t = new Date(since).getTime();
    list = list.filter((u) => new Date(u.timestamp).getTime() >= t);
  }
  return list.slice(-limit);
}

export function getUsageSummary(keyId?: string, since?: string): {
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
} {
  let list = usageLog;
  if (keyId) list = list.filter((u) => u.keyId === keyId);
  if (since) {
    const t = new Date(since).getTime();
    list = list.filter((u) => new Date(u.timestamp).getTime() >= t);
  }
  return list.reduce(
    (acc, u) => ({
      totalRequests: acc.totalRequests + 1,
      totalPromptTokens: acc.totalPromptTokens + u.promptTokens,
      totalCompletionTokens: acc.totalCompletionTokens + u.completionTokens,
      totalTokens: acc.totalTokens + u.totalTokens,
    }),
    { totalRequests: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0 }
  );
}
