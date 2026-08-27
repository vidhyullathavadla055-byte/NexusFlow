import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const COLLECTION = "users";
const SALT_ROUNDS = 10;

export async function ensureUserIndexes() {
  await getDb().collection(COLLECTION).createIndex({ email: 1 }, { unique: true });
}

export async function createUser({ name, email, password, role = "manager" }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const doc = {
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role, // "manager" | "admin" | "viewer"
    notifications: { sms: true, email: true, webhook: false },
    createdAt: new Date(),
  };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return toPublicUser({ _id: result.insertedId, ...doc });
}

export async function findUserByEmail(email) {
  return getDb().collection(COLLECTION).findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(id) {
  return getDb().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

/** Updates name/email. Throws a Mongo duplicate-key error (code 11000) if the new email is taken. */
export async function updateProfile(id, { name, email }) {
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (email !== undefined) patch.email = email.toLowerCase().trim();

  await getDb()
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: patch });
  return findUserById(id);
}

export async function updatePasswordHash(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await getDb()
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: { passwordHash } });
}

/** Partial update — only toggles the channels included in `patch` (e.g. { sms: false }). */
export async function updateNotifications(id, patch) {
  const $set = {};
  for (const [key, value] of Object.entries(patch)) {
    if (["sms", "email", "webhook"].includes(key)) $set[`notifications.${key}`] = !!value;
  }
  await getDb()
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set });
  return findUserById(id);
}

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    notifications: user.notifications || { sms: true, email: true, webhook: false },
    createdAt: user.createdAt,
  };
}