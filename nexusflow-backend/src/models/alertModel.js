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
  // NOTE: mongodb driver v6 defaults `includeResultMetadata` to false, so
  // findOneAndUpdate already resolves to the document itself (or null) —
  // it is NOT wrapped in { value: doc }. An earlier version of this code
  // did `result?.value || result`, assuming the old wrapped shape as a
  // fallback — but alert documents themselves have their own `value`
  // field (the sensor reading that triggered the alert), so that
  // fallback accidentally matched and returned just the raw reading
  // instead of the resolved alert. Do not reintroduce that fallback.
  const result = await getDb()
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: "resolved", resolvedAt: new Date() } },
      { returnDocument: "after" }
    );
  return result ?? null;
}
