import { getDb } from "../config/db.js";

const COLLECTION = "telemetry";

/**
 * Shape stored in the time-series collection:
 * {
 *   timestamp: Date,         // timeField
 *   metadata: {              // metaField — used for bucketing + filtering
 *     deviceId, metric, unit
 *   },
 *   value: Number
 * }
 */

export async function insertReading(reading) {
  const doc = {
    timestamp: new Date(reading.timestamp || Date.now()),
    metadata: {
      deviceId: reading.deviceId,
      metric: reading.metric,
      unit: reading.unit,
    },
    value: reading.value,
  };
  await getDb().collection(COLLECTION).insertOne(doc);
  return doc;
}

/** Batched insert — the path used by the high-throughput simulator / real hardware gateways. */
export async function insertReadingsBulk(readings) {
  if (!readings.length) return { insertedCount: 0 };
  const docs = readings.map((r) => ({
    timestamp: new Date(r.timestamp || Date.now()),
    metadata: { deviceId: r.deviceId, metric: r.metric, unit: r.unit },
    value: r.value,
  }));
  return getDb().collection(COLLECTION).insertMany(docs, { ordered: false });
}

export async function queryDeviceHistory(deviceId, { from, to, limit = 500 } = {}) {
  const match = { "metadata.deviceId": deviceId };
  if (from || to) {
    match.timestamp = {};
    if (from) match.timestamp.$gte = new Date(from);
    if (to) match.timestamp.$lte = new Date(to);
  }
  return getDb()
    .collection(COLLECTION)
    .find(match)
    .sort({ timestamp: -1 })
    .limit(Math.min(limit, 5000))
    .toArray();
}

/** Downsampled aggregation for dashboard sparklines — 1-minute buckets, average value. */
export async function queryDeviceRollup(deviceId, minutes = 60) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return getDb()
    .collection(COLLECTION)
    .aggregate([
      { $match: { "metadata.deviceId": deviceId, timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateTrunc: { date: "$timestamp", unit: "minute" },
          },
          avgValue: { $avg: "$value" },
          maxValue: { $max: "$value" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
}

export async function countReadings() {
  return getDb().collection(COLLECTION).estimatedDocumentCount();
}
