import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const COLLECTION = "alerts";

export async function recordAlert(alert) {
  const doc = {
    status: "open",
    severity: alert.severity || "warning",
    ...alert,
    createdAt: new Date(),
  };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function listAlerts({ limit = 50, deviceId, status } = {}) {
  const match = {};
  if (deviceId) match.deviceId = deviceId;
  if (status) match.status = status;
  return getDb()
    .collection(COLLECTION)
    .find(match)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 500))
    .toArray();
}

/** Marks an alert resolved. Returns the updated alert, or null if the id doesn't exist. */
export async function resolveAlert(id) {
  const result = await getDb()
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: "resolved", resolvedAt: new Date() } },
      { returnDocument: "after" }
    );
  return result?.value || result || null;
}
