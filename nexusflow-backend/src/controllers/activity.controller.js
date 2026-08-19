import { listActivity } from "../models/activityLogModel.js";

export async function list(req, res, next) {
  try {
    const { type, deviceId, graphId, limit } = req.query;
    const activity = await listActivity({
      type,
      deviceId,
      graphId,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(activity);
  } catch (err) {
    next(err);
  }
}
