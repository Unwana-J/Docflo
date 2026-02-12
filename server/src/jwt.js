import jwt from "jsonwebtoken";
import { config } from "./config.js";

export function signSession(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifySession(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const cookie = req.cookies?.docuflow_session;

  let token = null;
  if (cookie) token = cookie;
  else if (header?.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length);
  }

  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const payload = verifySession(token);
  if (!payload) {
    return res.status(401).json({ error: "invalid_token" });
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
  };
  next();
}

