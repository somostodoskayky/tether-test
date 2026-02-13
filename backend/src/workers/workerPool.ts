/**
 * Simulated GPU worker pool. Each "worker" is a virtual node that processes
 * inference jobs. Work is distributed round-robin; in production workers
 * would be separate processes or machines consuming from a shared queue.
 */

import { config } from "../config.js";
import { dequeue, type JobPayload, type JobResult } from "./taskQueue.js";

const workerCount = Math.max(1, config.workerCount);
let nextWorkerIndex = 0;

export function getWorkerCount(): number {
  return workerCount;
}

export function getNextWorkerId(): string {
  const id = `worker-${nextWorkerIndex % workerCount}`;
  nextWorkerIndex += 1;
  return id;
}

/**
 * Simulate inference: echo-style response with token counts.
 * In production this would call actual model runtime (e.g. vLLM, TGI).
 */
async function simulateInference(payload: JobPayload, _workerId: string): Promise<JobResult> {
  const promptTokens = payload.messages.reduce((s, m) => s + Math.ceil((m.content?.length ?? 0) / 4), 0);
  const lastMessage = payload.messages[payload.messages.length - 1]?.content ?? "";
  const reply = `[Simulated GPU response for: "${lastMessage.slice(0, 50)}..."]`;
  const completionTokens = Math.ceil(reply.length / 4);
  const total = Math.min(promptTokens + completionTokens, payload.maxTokens || 256);
  const compTokens = Math.max(0, total - promptTokens);
  return {
    content: reply,
    promptTokens,
    completionTokens: compTokens,
    finishReason: "stop",
  };
}

/**
 * Process one job from the queue (called by the API when handling inference).
 * In a real distributed setup, worker processes would pull from Redis and call
 * actual GPU inference.
 */
export async function processNextJob(): Promise<boolean> {
  const job = dequeue();
  if (!job) return false;
  const workerId = getNextWorkerId();
  try {
    const result = await simulateInference(job.payload, workerId);
    job.resolve(result);
  } catch (err) {
    job.reject(err instanceof Error ? err : new Error(String(err)));
  }
  return true;
}
