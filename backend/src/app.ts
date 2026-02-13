import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { requireApiKey } from "./middleware/auth.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { router as keysRouter } from "./routes/keys.js";
import { router as usageRouter } from "./routes/usage.js";
import { router as modelsRouter } from "./routes/models.js";
import { router as deploymentsRouter } from "./routes/deployments.js";
import { router as chatRouter } from "./routes/chat.js";
import { getQueueDepth } from "./workers/taskQueue.js";
import { getWorkerCount } from "./workers/workerPool.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins.length && config.corsOrigins[0] !== "*" ? config.corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/metrics", (_req, res) => {
  res.json({
    workers: getWorkerCount(),
    queueDepth: getQueueDepth(),
  });
});

const apiRouter = express.Router();
apiRouter.use(requireApiKey);
apiRouter.use(createRateLimiter(config.rateLimitRpm));
apiRouter.use("/keys", keysRouter);
apiRouter.use("/usage", usageRouter);
apiRouter.use("/models", modelsRouter);
apiRouter.use("/deployments", deploymentsRouter);
app.use("/api", apiRouter);

app.use("/v1/chat", requireApiKey, createRateLimiter(config.rateLimitRpm), chatRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { message: "Not found", code: "not_found" } });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: { message: "Internal server error", code: "internal_error" } });
});

export default app;
