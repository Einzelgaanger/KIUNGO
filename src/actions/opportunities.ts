"use server";

import { z } from "zod";
import type { ActionResult } from "@/types";

export async function expressInterest(
  input: unknown,
): Promise<ActionResult<{ recorded: true }>> {
  const parsed = z.object({ opportunityId: z.string() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose an opportunity." };
  return { ok: true, data: { recorded: true } };
}
