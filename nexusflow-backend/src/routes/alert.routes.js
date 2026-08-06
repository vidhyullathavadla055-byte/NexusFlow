import { Router } from "express";
import { list } from "../controllers/alert.controller.js";

const router = Router();
router.get("/", list);

export default router;
