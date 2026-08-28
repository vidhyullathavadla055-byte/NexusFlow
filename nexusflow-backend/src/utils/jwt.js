import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Single source of truth for token shape. This used to be duplicated
 * inline in auth.controller.js and authMiddleware.js — and had drifted:
 * this file signed { sub, email } while authMiddleware.js actually reads
 * payload.role for req.userRole. Anyone using this file's signToken would
 * have silently issued role-less tokens. Consolidated here instead.
 */
export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/** Returns the decoded payload, or throws if the token is invalid/expired. */
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
