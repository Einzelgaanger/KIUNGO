"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEMO_PERSONAS } from "@/lib/constants";
import { setSessionCookie } from "@/lib/session";
import type { ActionResult } from "@/types";

const schema = z.object({
  userId: z.string().min(1),
});

export async function switchPersona(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Choose a demo persona.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const persona = DEMO_PERSONAS.find((item) => item.id === parsed.data.userId);
  if (!persona) {
    return { ok: false, error: "That persona is not in the demonstration set." };
  }

  await setSessionCookie(persona.id);
  revalidatePath("/", "layout");
  return { ok: true, data: { userId: persona.id } };
}
