import { getDb } from "../config/db.js";

const COLLECTION = "deliveryHistory";

/**
 * @param {{channel:"webhook"|"sms", target:string, status:"delivered"|"failed", attempts:number, error?:string, meta?:object}} entry
 */
export async function recordDelivery(entry) {
  if (!entry?.channel || !entry?.target || !entry?.status) {
    throw new Error("Delivery history entry requires at least { channel, target, status }.");
  }
  const doc = {
    channel: entry.channel,
    target: entry.target,
    status: entry.status,
    attempts: entry.attempts || 1,
    error: entry.error || null,
    meta: entry.meta || {},
    createdAt: new Date(),
  };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function listDeliveries({ limit = 50, channel, status } = {}) {
  const match = {};
  if (channel) match.channel = channel;
  if (status) match.status = status;

  return getDb()
    .collection(COLLECTION)
    .find(match)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 500))
    .toArray();
}
