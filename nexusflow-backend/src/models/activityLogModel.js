import { getDb } from "../config/db.js";

const COLLECTION = "activityLog";

// Kept loose on purpose (not a strict enum) so future event types don't
// require a schema migration — but these are the ones the Week-3/4 plan
// calls out: pipeline deploys, rule triggers, and errors.
const KNOWN_TYPES = ["deploy", "rule_trigger", "error"];

/**
 * @param {{type:string, message:string, deviceId?:string, graphId?:string, meta?:object}} entry
 */
export async function recordActivity(entry) {
  if (!entry?.type || !entry?.message) {
    throw new Error("Activity log entry requires at least { type, message }.");
  }
  const doc = {
    type: entry.type,
    message: entry.message,
    deviceId: entry.deviceId || null,
    graphId: entry.graphId || null,
    meta: entry.meta || {},
    createdAt: new Date(),
  };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function listActivity({ limit = 50, type, deviceId, graphId } = {}) {
  const match = {};
  if (type) match.type = type;
  if (deviceId) match.deviceId = deviceId;
  if (graphId) match.graphId = graphId;

  return getDb()
    .collection(COLLECTION)
    .find(match)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 500))
    .toArray();
}

export function isKnownActivityType(type) {
  return KNOWN_TYPES.includes(type);
}