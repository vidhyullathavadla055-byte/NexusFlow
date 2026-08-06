import { Router } from "express";
import { ingestOne, ingestBulk } from "../controllers/ingest.controller.js";

const router = Router();
router.post("/", ingestOne);
router.post("/bulk", ingestBulk);

export default router;
