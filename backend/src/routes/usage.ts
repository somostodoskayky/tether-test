import { Router } from "express";
import * as usageService from "../services/usageService.js";
import { requireApiKey } from "../middleware/auth.js";

export const router = Router();

router.get("/", requireApiKey, (req, res) => {
  const keyId = req.query.keyId as string | undefined;
  const since = req.query.since as string | undefined;
  const summary = usageService.getUsageSummary(keyId, since);
  const byKey = keyId ? undefined : usageService.getUsageSummary(undefined, since);
  res.json({
    data: {
      summary,
      ...(byKey && keyId === undefined ? { allKeysSummary: byKey } : {}),
    },
  });
});

router.get("/history", requireApiKey, (req, res) => {
  const keyId = req.query.keyId as string | undefined;
  const since = req.query.since as string | undefined;
  const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 500);
  const history = keyId
    ? usageService.getUsageByKeyId(keyId, since).slice(-limit)
    : usageService.getAllUsage(since, limit);
  res.json({ data: { history } });
});
