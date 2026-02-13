import { Router, type Response } from "express";
import { requireApiKey, type AuthenticatedRequest } from "../middleware/auth.js";
import { recordKeyUsage } from "../services/apiKeyService.js";
import { recordUsage } from "../services/usageService.js";
import { runChatCompletion, runChatCompletionStream } from "../services/inferenceService.js";
import type { ChatCompletionRequest } from "../types.js";

export const router = Router();

router.post("/completions", requireApiKey, async (req: AuthenticatedRequest, res: Response) => {
  const keyId = req.apiKey!.id;
  recordKeyUsage(keyId);

  const body = req.body as Partial<ChatCompletionRequest>;
  const model = typeof body.model === "string" ? body.model : "gpt-sim";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    res.status(400).json({ error: { message: "messages array is required", code: "validation_error" } });
    return;
  }
  const stream = Boolean(body.stream);

  const request: ChatCompletionRequest = {
    model,
    messages: messages.map((m: { role?: string; content?: string }) => ({
      role: (m.role === "system" || m.role === "user" || m.role === "assistant" ? m.role : "user") as "system" | "user" | "assistant",
      content: typeof m.content === "string" ? m.content : "",
    })),
    stream,
    max_tokens: typeof body.max_tokens === "number" ? body.max_tokens : 256,
    temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
  };

  try {
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();
      for await (const chunk of runChatCompletionStream(request, keyId)) {
        res.write(chunk);
        (res as { flush?: () => void }).flush?.();
      }
      res.end();
    } else {
      const response = await runChatCompletion(request, keyId);
      const usage = response.usage;
      if (usage) {
        recordUsage({
          keyId,
          model,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        });
      }
      res.json(response);
    }
  } catch (err) {
    console.error("Inference error:", err);
    res.status(500).json({ error: { message: "Inference failed", code: "internal_error" } });
  }
});
