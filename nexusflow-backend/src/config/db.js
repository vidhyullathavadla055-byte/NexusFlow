import { MongoClient } from "mongodb";
import { env } from "./env.js";
import { ensureUserIndexes } from "../models/userModel.js";

let client;
let db;

/**
 * Connects to MongoDB and provisions the native Time-Series collection used
 * for high-frequency sensor telemetry, plus supporting collections for
 * saved rule graphs and the alert log.
 *
 * Time-series collections (MongoDB 5.0+) store measurements bucketed
 * internally by time + metadata, which is what makes them efficient for
 * append-only, high-ingest sensor data compared to a standard collection.
 */
export async function connectDB() {
  client = new MongoClient(env.mongoUri, {
    maxPoolSize: 50, // sized for high-throughput ingestion, see docs/mid-project-review.md
  });
  await client.connect();
  db = client.db(env.mongoDbName);

  await ensureTimeSeriesCollection();
  await ensureSupportingCollections();

  console.log(`[db] connected to MongoDB → ${env.mongoDbName}`);
  return db;
}

async function ensureTimeSeriesCollection() {
  const existing = await db.listCollections({ name: "telemetry" }).toArray();
  if (existing.length > 0) return;

  try {
    await db.createCollection("telemetry", {
      timeseries: {
        timeField: "timestamp",
        metaField: "metadata", // { deviceId, metric, unit }
        granularity: "seconds",
      },
      // Optional: auto-expire raw readings after 30 days. Remove for
      // permanent retention, or move cold data to a rollup collection.
      expireAfterSeconds: 60 * 60 * 24 * 30,
    });
    console.log("[db] created time-series collection: telemetry");
  } catch (err) {
    // 48 = NamespaceExists — safe to ignore on repeated boots
    if (err.code !== 48) throw err;
  }

  await db.collection("telemetry").createIndex({ "metadata.deviceId": 1, timestamp: -1 });
}

async function ensureSupportingCollections() {
  await db.collection("graphs").createIndex({ updatedAt: -1 });
  await db.collection("graphs").createIndex({ owner: 1 }); // per-user graph scoping
  await db.collection("alerts").createIndex({ createdAt: -1 });
  await db.collection("alerts").createIndex({ deviceId: 1 });
  await ensureUserIndexes(); // unique index on users.email
}

export function getDb() {
  if (!db) throw new Error("Database not connected yet — call connectDB() first.");
  return db;
}

export async function closeDB() {
  if (client) await client.close();
}