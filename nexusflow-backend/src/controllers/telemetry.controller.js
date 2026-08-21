import { queryDeviceHistory, queryDeviceRollup, countReadings } from "../models/telemetryModel.js";
import { DEVICES } from "../data/deviceRegistry.js";

export async function getHistory(req, res, next) {
  try {
    const { deviceId } = req.params;
    const { from, to, limit } = req.query;
    const rows = await queryDeviceHistory(deviceId, { from, to, limit: limit ? Number(limit) : undefined });
    res.json({ deviceId, count: rows.length, readings: rows });
  } catch (err) {
    next(err);
  
export async function getRollup(req, res, next) {
  try {
    const { deviceId } = req.params;
    const minutes = req.query.minutes ? Number(req.query.minutes) : 60;
    const buckets = await queryDeviceRollup(deviceId, minutes);
    res.json({ deviceId, minutes, buckets });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const totalReadings = await countReadings();
    res.json({ totalReadings, devices: DEVICES.length });
  } catch (err) {
    next(err);
  }
}
