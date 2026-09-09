import { cookies } from "next/headers";
import { SESSION_COOKIE, signSession, verifySessionToken } from "./session-token";
import { getHousehold, getMember } from "./store";
import type { Household, Member, Session } from "./types";

export type ActiveSession = {
  session: Session;
  member: Member;
  household: Household;
};

export async function getActiveSession(): Promise<ActiveSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;
  const [member, household] = await Promise.all([getMember(session.memberId), getHousehold(session.householdId)]);
  if (!member || !household) return null;
  if (member.householdId !== household.id) return null;
  if (member.id !== session.memberId) return null;
  return { session, member, household };
}

export async function setSessionCookie(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
