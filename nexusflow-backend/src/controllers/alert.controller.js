import { listAlerts, resolveAlert } from "../models/alertModel.js";

export async function list(req, res, next) {
  try {
    const { deviceId, status, limit } = req.query;
    const alerts = await listAlerts({ deviceId, status, limit: limit ? Number(limit) : undefined });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

export async function resolve(req, res, next) {
  try {
    const updated = await resolveAlert(req.params.id);
    if (!updated) return res.status(404).json({ error: "Alert not found." });
    res.json(updated);
  } catch (err) {
    // A malformed :id (not a valid ObjectId) throws inside the driver —
    // that's a client mistake, not a server failure, so 400 not 500.
    if (err.name === "BSONError" || /ObjectId/.test(err.message)) {
      return res.status(400).json({ error: "Invalid alert id." });
    }
    next(err);
  }
}
