"use server";

import { z } from "zod";
import type { ActionResult } from "@/types";

const inviteSchema = z.object({
  entityId: z.string().min(1),
  message: z.string().max(400).optional(),
});

export async function inviteToQuote(
  input: unknown,
): Promise<ActionResult<{ recorded: true }>> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Choose an entity to invite.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  return { ok: true, data: { recorded: true } };
}
