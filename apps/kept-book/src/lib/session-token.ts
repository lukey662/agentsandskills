import { createHmac, timingSafeEqual } from "node:crypto";
import type { Session } from "./types";

export const SESSION_COOKIE = "kept_book";

export function sessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }
  return "kept-book-local-dev-only";
}

export function signSession(session: Session, secret = sessionSecret()): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string, secret = sessionSecret()): Session | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (typeof parsed.memberId !== "string" || typeof parsed.householdId !== "string") return null;
    if (!parsed.memberId || !parsed.householdId) return null;
    return { memberId: parsed.memberId, householdId: parsed.householdId };
  } catch {
    return null;
  }
}
