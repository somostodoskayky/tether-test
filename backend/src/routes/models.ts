import { Router } from "express";
import * as modelDeploymentService from "../services/modelDeploymentService.js";
import { requireApiKey } from "../middleware/auth.js";

export const router = Router();

router.get("/", requireApiKey, (_req, res) => {
  const names = modelDeploymentService.listModelNames();
  const deployments = modelDeploymentService.listDeployments();
  res.json({
    data: names.map((name) => ({ id: name, object: "model", owned_by: "gpu-cloud" })),
    deployments: deployments.map((d) => ({ id: d.id, name: d.name, status: d.status, workerId: d.workerId })),
  });
});
