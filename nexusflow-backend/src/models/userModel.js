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

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
