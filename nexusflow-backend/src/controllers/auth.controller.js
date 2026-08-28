import { createUser, findUserByEmail, findUserById, verifyPassword, toPublicUser } from "../models/userModel.js";
import { signToken } from "../utils/jwt.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required." });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email." });
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: "An account with that email already exists." });

    const user = await createUser({ name: name.trim(), email, password });
    const rawUser = await findUserByEmail(email); // need _id for token signing
    const token = signToken(rawUser);

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "An account with that email already exists." });
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const valid = await verifyPassword(user, password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken(user);
    res.json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}
