import { Router } from "express";
import * as modelDeploymentService from "../services/modelDeploymentService.js";
import { getNextWorkerId } from "../workers/workerPool.js";
import { requireApiKey } from "../middleware/auth.js";

export const router = Router();

router.get("/", requireApiKey, (_req, res) => {
  const list = modelDeploymentService.listDeployments();
  res.json({ data: list });
});

router.post("/", requireApiKey, (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: { message: "name is required", code: "validation_error" } });
    return;
  }
  const workerId = getNextWorkerId();
  const deployment = modelDeploymentService.createDeployment(name, workerId);
  res.status(201).json({ data: deployment });
});
