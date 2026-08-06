import { Router } from "express";
import { getHistory, getRollup, getStats } from "../controllers/telemetry.controller.js";

const router = Router();
router.get("/stats", getStats);
router.get("/:deviceId/history", getHistory);
router.get("/:deviceId/rollup", getRollup);

export default router;
