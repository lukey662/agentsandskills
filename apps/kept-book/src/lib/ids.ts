import { randomBytes, randomUUID } from "node:crypto";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newId(): string {
  return randomUUID();
}

export function newInviteCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    const byte = bytes[i];
    if (byte === undefined) {
      throw new Error("invite code entropy failed");
    }
    out += INVITE_ALPHABET[byte % INVITE_ALPHABET.length];
  }
  return out;
}

export function nowIso(): string {
  return new Date().toISOString();
}
