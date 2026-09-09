import { cookies } from "next/headers";
import { DEMO_PERSONAS, SESSION_COOKIE } from "@/lib/constants";
import type { Session } from "@/types";

export function personaToSession(
  persona: (typeof DEMO_PERSONAS)[number],
): Session {
  return {
    userId: persona.id,
    name: persona.name,
    role: persona.role,
    entityId: persona.entityId,
    entityName: persona.entityName,
    countyCode: persona.countyCode,
    phone: persona.phone,
  };
}

export async function getSession(): Promise<Session> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  const persona =
    DEMO_PERSONAS.find((item) => item.id === id) ?? DEMO_PERSONAS[0];
  if (!persona) {
    const fallback = DEMO_PERSONAS[0];
    if (!fallback) {
      throw new Error("Demo personas are not configured.");
    }
    return personaToSession(fallback);
  }
  return personaToSession(persona);
}

export async function setSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}
