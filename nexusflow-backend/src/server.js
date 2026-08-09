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
import graphRoutes from "./routes/graph.routes.js";
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

  // Krishna — Week 1 scope (Auth API, now wired up)
  app.use("/api/auth", authRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/graphs", graphRoutes); 
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  // Day 4 — wrap app in a raw http server so WebSocket can attach to it
  const server = http.createServer(app);
  initWebSocket(server); // ws clients connect at ws://<host>:<port>/ws

  server.listen(env.port, () => {
    console.log(`[server] NexusFlow backend (Week 1) listening on :${env.port}`);
    console.log(`[server] Health         http://localhost:${env.port}/health`);
    console.log(`[server] WebSocket      ws://localhost:${env.port}/ws`);
    console.log(`[server] Ingest         POST http://localhost:${env.port}/api/ingest`);
    console.log(`[server] Ingest bulk    POST http://localhost:${env.port}/api/ingest/bulk`);
    console.log(`[server] Telemetry      GET  http://localhost:${env.port}/api/telemetry/stats`);
    console.log(`[server] Devices        GET  http://localhost:${env.port}/api/devices`);
    console.log(`[server] Auth           POST http://localhost:${env.port}/api/auth/signup`);
    console.log(`[server] Auth           POST http://localhost:${env.port}/api/auth/login`);
    console.log(`[server] Auth           GET  http://localhost:${env.port}/api/auth/me`);
  });
}

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});