import type { Request, Response, NextFunction } from "express";
import { validateApiKey } from "../services/apiKeyService.js";
import type { ApiKeyRecord } from "../types.js";

export type AuthenticatedRequest = Request & { apiKey?: ApiKeyRecord };

export function requireApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const record = validateApiKey(req.headers.authorization);
  if (!record) {
    res.status(401).json({ error: { message: "Invalid or missing API key", code: "invalid_api_key" } });
    return;
  }
  req.apiKey = record;
  next();
}
