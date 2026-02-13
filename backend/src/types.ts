/**
 * Shared types for API and inference.
 */

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UsageRecord {
  keyId: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface DeployedModel {
  id: string;
  name: string;
  status: "deploying" | "ready" | "failed";
  workerId?: string;
  createdAt: string;
}

/** OpenAI-compatible chat message */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Request body for /v1/chat/completions */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

/** Non-streaming response chunk */
export interface ChatCompletionChoice {
  index: number;
  message: { role: string; content: string };
  finish_reason: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}
