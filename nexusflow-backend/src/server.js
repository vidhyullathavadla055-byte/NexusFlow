import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initWebSocket } from "./websocket/wsServer.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { ensureUserIndexes } from "./models/userModel.js";
import { startAutoSimulator } from "./services/autoSimulator.js";

import authRoutes from "./routes/auth.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import telemetryRoutes from "./routes/telemetry.routes.js";
import graphRoutes from "./routes/graph.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import deviceRoutes from "./routes/device.routes.js";

async function main() {
  await connectDB();
  await ensureUserIndexes();

  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "2mb" })); // graphs can get large; telemetry payloads stay tiny
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true, service: "nexusflow-backend" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/ingest", ingestRoutes);
  app.use("/api/telemetry", telemetryRoutes);
  app.use("/api/graphs", graphRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/devices", deviceRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  initWebSocket(server); // ws clients connect at ws://<host>:<port>/ws

  server.listen(env.port, () => {
    console.log(`[server] NexusFlow backend listening on :${env.port}`);
    console.log(`[server] WebSocket stream       ws://localhost:${env.port}/ws`);
    console.log(`[server] REST API                http://localhost:${env.port}/api`);
    startAutoSimulator();
  });
}

main().catch((err) => {
  console.error("[server] fatal startup error:", err);
  process.exit(1);
});
