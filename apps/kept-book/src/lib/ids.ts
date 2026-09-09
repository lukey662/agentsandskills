import { randomInt, randomUUID } from "node:crypto";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newId(): string {
  return randomUUID();
}

export function newInviteCode(): string {
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    const index = randomInt(INVITE_ALPHABET.length);
    const char = INVITE_ALPHABET[index];
    if (!char) {
      throw new Error("invite code entropy failed");
    }
    out += char;
  }
  return out;
}

export function nowIso(): string {
  return new Date().toISOString();
}
