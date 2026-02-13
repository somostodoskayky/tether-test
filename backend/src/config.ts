/**
 * Central configuration from environment variables.
 */

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  workerCount: parseInt(process.env.WORKER_COUNT ?? "3", 10),
  rateLimitRpm: parseInt(process.env.RATE_LIMIT_RPM ?? "60", 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) ?? ["http://localhost:5173"],
  adminKey: process.env.ADMIN_KEY ?? "",
} as const;
