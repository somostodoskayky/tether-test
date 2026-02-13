/**
 * Per-API-key rate limiting. Uses in-memory sliding window.
 * Production would use Redis for distributed rate limiting.
 */

import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.js";

const windowMs = 60 * 1000; // 1 minute
const limits = new Map<string, { count: number; resetAt: number }>();

export function createRateLimiter(rpm: number) {
  return function rateLimit(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const key = req.apiKey?.id;
    if (!key) {
      next();
      return;
    }
    const now = Date.now();
    let entry = limits.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      limits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > rpm) {
      res.status(429).json({
        error: { message: "Rate limit exceeded. Try again later.", code: "rate_limit_exceeded" },
      });
      return;
    }
    next();
  };
}
