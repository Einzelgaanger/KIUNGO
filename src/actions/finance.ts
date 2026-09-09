"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ActionResult } from "@/types";

const schema = z.object({
  productId: z.string(),
  amount: z.number().positive(),
  consent: z.literal(true),
});

export async function applyForFinance(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Amount and consent are required." };
  }
  const session = await getSession();
  if (!session.entityId) return { ok: false, error: "Switch to a supplier persona." };
  const [product, entity] = await Promise.all([
    prisma.financeProduct.findUnique({ where: { id: parsed.data.productId } }),
    prisma.entity.findUnique({ where: { id: session.entityId } }),
  ]);
  if (!product || !entity) return { ok: false, error: "Product not found." };
  if (product.requiresVerified && entity.verification !== "VERIFIED") {
    return { ok: false, error: "This product requires a verified profile." };
  }
  if ((entity.reliability ?? 0) < product.minReliability) {
    return {
      ok: false,
      error: `Requires reliability ${product.minReliability}. You are at ${entity.reliability ?? 0}.`,
    };
  }
  if (parsed.data.amount < product.minAmount || parsed.data.amount > product.maxAmount) {
    return { ok: false, error: "Amount is outside the product range." };
  }
  const app = await prisma.financeApplication.create({
    data: {
      productId: product.id,
      entityId: entity.id,
      amount: parsed.data.amount,
      status: "SUBMITTED",
    },
  });
  revalidatePath("/finance");
  return { ok: true, data: { id: app.id } };
}
