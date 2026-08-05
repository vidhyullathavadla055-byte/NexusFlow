import express from "express";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("NexusFlow Backend is Running...");
});

async function main() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`[server] NexusFlow backend listening on :${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});