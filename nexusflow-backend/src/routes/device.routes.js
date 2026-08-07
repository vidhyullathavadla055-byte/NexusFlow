import { Router } from "express";
import { DEVICES } from "../data/deviceRegistry.js";

const router = Router();
router.get( "/", ( req, res ) => res.json( DEVICES ) );

export default router;
