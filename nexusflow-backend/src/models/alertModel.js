import { getDb } from "../config/db.js";

const COLLECTION = "alerts";

export async function recordAlert(alert) {
  const doc = { ...alert, createdAt: new Date() };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function listAlerts({ limit = 50, deviceId } = {}) {
  const match = deviceId ? { deviceId } : {};
  return getDb()
    .collection(COLLECTION)
    .find(match)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 500))
    .toArray();
}
