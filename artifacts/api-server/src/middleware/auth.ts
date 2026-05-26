import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../env.js";

export interface AuthPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { username: string; role: string }) {
  const body = { ...payload, iat: Date.now() };
  const json = JSON.stringify(body);
  const data = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", env.JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, sig] = parts;
    const expected = crypto.createHmac("sha256", env.JWT_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const json = Buffer.from(data, "base64url").toString();
    return JSON.parse(json) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Allow passwordless access in development when configured
  try {
    if (env.ALLOW_PASSWORDLESS_ADMIN) {
      (req as any).auth = { username: "dev", role: "admin" } as AuthPayload;
      return next();
    }
  } catch (e) {
    // fall through to normal auth
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    console.warn("requireAuth: missing or invalid Authorization header", { headers: req.headers });
    return res.status(401).json({ error: "missing_token" });
  }
  const token = auth.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    console.warn("requireAuth: token verification failed", { token: token?.slice(0, 8) });
    return res.status(401).json({ error: "invalid_token" });
  }
  (req as any).auth = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const payload = (req as any).auth as AuthPayload | undefined;
  if (!payload || payload.role !== "admin") return res.status(403).json({ error: "forbidden" });
  next();
}

export default { requireAuth, requireAdmin, signToken, verifyToken };
