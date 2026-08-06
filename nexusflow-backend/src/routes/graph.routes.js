import { Router } from "express";
import { create, update, getOne, list, remove, deploy, stop } from "../controllers/graph.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", requireAuth, list);
router.post("/", requireAuth, create);
router.get("/:id", requireAuth, getOne);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);
router.post("/:id/deploy", requireAuth, deploy);
router.post("/:id/stop", requireAuth, stop);

export default router;
