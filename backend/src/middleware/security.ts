import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

const MAX_SKEW_MS = 5 * 60 * 1000; // 5 minutes
const REQUIRED_HEADERS = ["x-timestamp", "x-signature", "idempotency-key"];
const HMAC_SECRET = process.env.HMAC_SECRET || "dev-secret-key-change-in-production";

// constant-time compare
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function requireHeaders(req: Request, res: Response, next: NextFunction) {
  for (const h of REQUIRED_HEADERS) {
    if (!req.header(h)) {
      return res.status(400).json({ error: "missing_header", header: h });
    }
  }
  next();
}

export function verifyHmac(req: Request, res: Response, next: NextFunction) {
  try {
    const ts = Number(req.header("x-timestamp"));
    if (!Number.isFinite(ts)) return res.status(400).json({ error: "bad_timestamp" });
    if (Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
      return res.status(401).json({ error: "timestamp_out_of_window" });
    }

    const provided = req.header("x-signature")!;
    const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    const toSign = `${ts}.${payload}`;
    const expected = crypto.createHmac("sha256", HMAC_SECRET).update(toSign).digest("hex");

    if (!safeEqual(provided, expected)) {
      return res.status(401).json({ error: "invalid_signature" });
    }

    next();
  } catch (e) {
    return res.status(400).json({ error: "hmac_verification_error" });
  }
}

// Example idempotency gate (replace with your datastore)
const seen = new Set<string>();
export function idempotencyGate(req: Request, res: Response, next: NextFunction) {
  const key = req.header("idempotency-key")!;
  if (seen.has(key)) return res.status(409).json({ error: "idempotency_conflict" });
  seen.add(key);
  next();
}