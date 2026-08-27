import {
  findUserById,
  verifyPassword,
  updateProfile as updateProfileModel,
  updatePasswordHash,
  updateNotifications as updateNotificationsModel,
  toPublicUser,
} from "../models/userModel.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getSettings(req, res, next) {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Name cannot be empty." });
    }
    if (email !== undefined && !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    const updated = await updateProfileModel(req.userId, { name, email });
    res.json(toPublicUser(updated));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "An account with that email already exists." });
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const valid = await verifyPassword(user, currentPassword);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    await updatePasswordHash(req.userId, newPassword);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function updateNotifications(req, res, next) {
  try {
    const { sms, email, webhook } = req.body;
    const hasAtLeastOneField = [sms, email, webhook].some((v) => v !== undefined);
    if (!hasAtLeastOneField) {
      return res.status(400).json({ error: "Provide at least one of sms, email, webhook." });
    }

    const updated = await updateNotificationsModel(req.userId, { sms, email, webhook });
    res.json(toPublicUser(updated));
  } catch (err) {
    next(err);
  }
}
