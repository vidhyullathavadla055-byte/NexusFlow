import { Router } from "express";
import { list, resolve } from "../controllers/alert.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", list);
router.patch("/:id/resolve", requireAuth, resolve);

export default router;
