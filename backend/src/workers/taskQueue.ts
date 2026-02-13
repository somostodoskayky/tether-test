/**
 * In-memory distributed task queue for inference jobs.
 * Jobs are round-robin assigned to worker IDs; in production this would be
 * a real queue (e.g. Redis/BullMQ) with workers on separate processes/machines.
 */

export type JobPayload = {
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens: number;
  temperature: number;
};

export type JobResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
  finishReason: string;
};

export type QueuedJob = {
  id: string;
  payload: JobPayload;
  resolve: (result: JobResult) => void;
  reject: (err: Error) => void;
};

const queue: QueuedJob[] = [];
let jobIdCounter = 0;

export function enqueue(job: Omit<QueuedJob, "id">): string {
  const id = `job_${++jobIdCounter}_${Date.now()}`;
  queue.push({ ...job, id });
  return id;
}

export function dequeue(): QueuedJob | undefined {
  return queue.shift();
}

export function getQueueLength(): number {
  return queue.length;
}

export function getQueueDepth(): number {
  return queue.length;
}
