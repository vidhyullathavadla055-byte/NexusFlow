import { Router } from "express";
import { getSettings, updateProfile, changePassword, updateNotifications } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", requireAuth, getSettings);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, changePassword);
router.patch("/notifications", requireAuth, updateNotifications);

export default router;
