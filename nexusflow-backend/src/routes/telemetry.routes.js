import { Router } from "express";
import { getHistory, getRollup, getStats } from "../controllers/telemetry.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// Week-2 plan: authMiddleware.js is meant to "protect all pipeline/graph
// and telemetry APIs" — graph.routes.js already had it, telemetry.routes.js
// didn't. Anyone could read raw device history/rollups/stats without
// logging in. Locking that down here.
const router = Router();
router.get("/stats", requireAuth, getStats);
router.get("/:deviceId/history", requireAuth, getHistory);
router.get("/:deviceId/rollup", requireAuth, getRollup);

export default router;
