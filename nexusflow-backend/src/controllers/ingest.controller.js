import { insertReading, insertReadingsBulk } from "../models/telemetryModel.js";
import { pushReading } from "../services/telemetryBus.js";

function isValidReading(r) {
  return r && typeof r.deviceId === "string" && typeof r.value === "number";
}

/** POST /api/ingest — single reading, used by real hardware gateways. */
export async function ingestOne(req, res, next) {
  try {
    const reading = req.body;
    if (!isValidReading(reading)) {
      return res.status(400).json({ error: "Reading requires at least { deviceId: string, value: number }." });
    }
    const doc = await insertReading(reading);
    pushReading({ ...reading, timestamp: doc.timestamp.getTime() });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** POST /api/ingest/bulk — batched writes, used by the simulator / edge gateways for throughput. */
export async function ingestBulk(req, res, next) {
  try {
    const readings = req.body?.readings;
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ error: "Body must be { readings: Reading[] }." });
    }
    const invalid = readings.find((r) => !isValidReading(r));
    if (invalid) {
      return res.status(400).json({ error: "One or more readings are missing deviceId/value.", sample: invalid });
    }

    const result = await insertReadingsBulk(readings);
    readings.forEach((r) => pushReading({ ...r, timestamp: r.timestamp || Date.now() }));

    res.status(201).json({ ok: true, insertedCount: result.insertedCount ?? readings.length });
  } catch (err) {
    next(err);
  }
}
