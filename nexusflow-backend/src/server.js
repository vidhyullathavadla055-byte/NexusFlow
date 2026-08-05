import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

import { getHealth } from "./controllers/health.controller.js";

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", getHealth);

app.listen(PORT, () => {
  console.log(`[server] NexusFlow backend (Day 1) listening on :${PORT}`);
  console.log(`[server] Health check       http://localhost:${PORT}/health`);
});
