/**
 * Inference service: enqueues jobs, processes via worker pool, returns OpenAI-format responses.
 */

import { v4 as uuidv4 } from "uuid";
import { enqueue, type JobPayload, type JobResult } from "../workers/taskQueue.js";
import { processNextJob } from "../workers/workerPool.js";
import { recordUsage } from "./usageService.js";
import type { ChatCompletionRequest, ChatCompletionResponse } from "../types.js";

function toPayload(req: ChatCompletionRequest): JobPayload {
  return {
    model: req.model,
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    maxTokens: req.max_tokens ?? 256,
    temperature: req.temperature ?? 0.7,
  };
}

export async function runChatCompletion(
  req: ChatCompletionRequest,
  keyId: string
): Promise<ChatCompletionResponse> {
  const payload = toPayload(req);
  const result = await new Promise<JobResult>((resolve, reject) => {
    enqueue({ payload, resolve, reject });
    void processNextJob();
  });
  const id = `chatcmpl-${uuidv4().slice(0, 8)}`;
  const created = Math.floor(Date.now() / 1000);
  return {
    id,
    object: "chat.completion",
    created,
    model: req.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: result.content },
        finish_reason: result.finishReason,
      },
    ],
    usage: {
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.promptTokens + result.completionTokens,
    },
  };
}

export async function* runChatCompletionStream(
  req: ChatCompletionRequest,
  keyId: string
): AsyncGenerator<string> {
  const payload = toPayload(req);
  const result = await new Promise<JobResult>((resolve, reject) => {
    enqueue({ payload, resolve, reject });
    processNextJob();
  });
  const id = `chatcmpl-${uuidv4().slice(0, 8)}`;
  const created = Math.floor(Date.now() / 1000);
  const content = result.content;
  // Simulate token-by-token streaming
  const chunkSize = Math.max(1, Math.ceil(content.length / 5));
  for (let i = 0; i < content.length; i += chunkSize) {
    const piece = content.slice(i, i + chunkSize);
    const delta = { role: "assistant" as const, content: piece };
    const chunk = {
      id,
      object: "chat.completion.chunk" as const,
      created,
      model: req.model,
      choices: [{ index: 0, delta, finish_reason: null as string | null }],
    };
    yield `data: ${JSON.stringify(chunk)}\n\n`;
  }
  yield `data: ${JSON.stringify({
    id,
    object: "chat.completion.chunk",
    created,
    model: req.model,
    choices: [
      { index: 0, delta: {}, finish_reason: result.finishReason },
    ],
  })}\n\n`;
  yield `data: ${JSON.stringify({ usage: { prompt_tokens: result.promptTokens, completion_tokens: result.completionTokens, total_tokens: result.promptTokens + result.completionTokens } })}\n\n`;
  recordUsage({
    keyId,
    model: req.model,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.promptTokens + result.completionTokens,
  });
  yield "data: [DONE]\n\n";
}
