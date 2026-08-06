import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const COLLECTION = "users";
const SALT_ROUNDS = 10;

function users() {
  return getDb().collection(COLLECTION);
}

/**
 * Strips the password hash (and any other private fields) before a user
 * document ever leaves the backend — controllers should always send this
 * shape back to the frontend, never the raw DB document.
 */
export function toPublicUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt,
  };
}

export async function findUserByEmail(email) {
  return users().findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null;
  return users().findOne({ _id: new ObjectId(id) });
}

/**
 * Creates a new user with a bcrypt-hashed password.
 * Throws a plain Error with a friendly message if the email is already taken
 * (relies on the unique index created in config/db.js as the source of truth,
 * so this stays correct even under a race between two concurrent signups).
 */
export async function createUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const doc = {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  };

  try {
    const result = await users().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("An account with this email already exists.");
    }
    throw err;
  }
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}
