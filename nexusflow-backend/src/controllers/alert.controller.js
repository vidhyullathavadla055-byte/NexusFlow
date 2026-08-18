import { listAlerts } from "../models/alertModel.js";

export async function list(req, res, next) {
  try {
    const { deviceId, limit } = req.query;
    const alerts = await listAlerts({ deviceId, limit: limit ? Number(limit) : undefined });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}
