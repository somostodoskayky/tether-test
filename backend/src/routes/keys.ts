import { Router } from "express";
import * as apiKeyService from "../services/apiKeyService.js";
import { requireApiKey } from "../middleware/auth.js";

export const router = Router();

router.get("/", requireApiKey, (_req, res) => {
  const keys = apiKeyService.listApiKeys();
  res.json({ data: keys.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt })) });
});

router.post("/", requireApiKey, (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: { message: "name is required", code: "validation_error" } });
    return;
  }
  const { id, key, record } = apiKeyService.createApiKey(name);
  res.status(201).json({
    data: { id, key, name: record.name, prefix: record.prefix, createdAt: record.createdAt },
  });
});

router.delete("/:id", requireApiKey, (req, res) => {
  const deleted = apiKeyService.deleteApiKey(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: { message: "API key not found", code: "not_found" } });
    return;
  }
  res.status(200).json({ data: { deleted: true } });
});
