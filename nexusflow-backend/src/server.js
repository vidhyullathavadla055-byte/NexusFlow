import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initWebSocket } from "./websocket/wsServer.js";

import ingestRoutes from "./routes/ingest.routes.js";
import telemetryRoutes from "./routes/telemetry.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
//import graphRoutes from "./routes/graph.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { startAutoSimulator } from "./services/autoSimulator.js";

async function start() {
  await connectDB();

  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true, week: 1 }));

  // Mohan — Week 1 scope
  app.use("/api/ingest", ingestRoutes);
  app.use("/api/telemetry", telemetryRoutes);
  app.use("/api/devices", deviceRoutes);

  // Krishna — Auth & Health
  app.use("/api/auth", authRoutes);
  app.use("/api/health", healthRoutes);

  // Akshaya — Graphs
  //app.use("/api/graphs", graphRoutes);

  // Alerts
  app.use("/api/alerts", alertRoutes);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  initWebSocket(server);

  server.listen(env.port, () => {
    console.log(`[server] NexusFlow backend listening on :${env.port}`);
    console.log(`[server] Health         http://localhost:${env.port}/health`);
    console.log(`[server] WebSocket      ws://localhost:${env.port}/ws`);
    console.log(`[server] Ingest         POST http://localhost:${env.port}/api/ingest`);
    console.log(`[server] Ingest bulk    POST http://localhost:${env.port}/api/ingest/bulk`);
    console.log(`[server] Telemetry      GET  http://localhost:${env.port}/api/telemetry/stats`);
    console.log(`[server] Devices        GET  http://localhost:${env.port}/api/devices`);
    console.log(`[server] Auth           POST http://localhost:${env.port}/api/auth/signup`);
    console.log(`[server] Auth           POST http://localhost:${env.port}/api/auth/login`);
    console.log(`[server] Auth           GET  http://localhost:${env.port}/api/auth/me`);
    console.log(`[server] Alerts         GET  http://localhost:${env.port}/api/alerts`);

    startAutoSimulator();
  });
}

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});