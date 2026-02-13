/**
 * Simulated model deployment: register models and assign to workers.
 * In production this would coordinate with actual GPU nodes and registries.
 */

import { v4 as uuidv4 } from "uuid";
import type { DeployedModel } from "../types.js";

const deployments = new Map<string, DeployedModel>();

export function listDeployments(): DeployedModel[] {
  return Array.from(deployments.values());
}

export function createDeployment(name: string, workerId: string): DeployedModel {
  const id = uuidv4();
  const model: DeployedModel = {
    id,
    name,
    status: "deploying",
    workerId,
    createdAt: new Date().toISOString(),
  };
  deployments.set(id, model);
  // Simulate async deployment completion
  setImmediate(() => {
    model.status = "ready";
  });
  return model;
}

export function getDeployment(id: string): DeployedModel | undefined {
  return deployments.get(id);
}

export function getDeploymentByName(name: string): DeployedModel | undefined {
  return Array.from(deployments.values()).find((m) => m.name === name);
}

export function listModelNames(): string[] {
  return Array.from(deployments.values())
    .filter((m) => m.status === "ready")
    .map((m) => m.name);
}
