"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveSiteAndReviewer } from "@/lib/geo-resolve";
import { getSession } from "@/lib/session";
import { scoreForEntity } from "@/lib/entities";
import { computeValueOutcome } from "@/lib/value-engine";
import { hasHardFail, runEdgeChecks } from "@/lib/verification";
import type { ActionResult } from "@/types";

const evidenceSchema = z.object({
  url: z.string().min(1),
  sha256: z.string().min(16),
  exifLat: z.number().nullable().optional(),
  exifLng: z.number().nullable().optional(),
  capturedAt: z.string().datetime().nullable().optional(),
  deviceHint: z.string().optional(),
});

const submitSchema = z.object({
  contractLineId: z.string().min(1),
  quantity: z.number().positive(),
  lat: z.number(),
  lng: z.number(),
  evidence: z.array(evidenceSchema).min(1),
  note: z.string().max(200).optional(),
  channel: z.enum(["WHATSAPP", "WEB", "USSD"]).default("WEB"),
});

const decideSchema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(["APPROVE", "QUERY", "REJECT"]),
  comment: z.string().max(500).optional(),
});

async function nextClaimRef(): Promise<string> {
  const count = await prisma.claim.count();
  return `CLM-2026-${String(count + 1).padStart(6, "0")}`;
}

async function recomputeReliability(entityId: string) {
  const result = await scoreForEntity(entityId);
  await prisma.entity.update({
    where: { id: entityId },
    data: { reliability: result.score },
  });
}

export async function submitClaim(
  input: unknown,
): Promise<ActionResult<{ id: string; ref: string; status: string }>> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the delivery details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.entityId) {
    return { ok: false, error: "This persona cannot submit a delivery." };
  }

  const line = await prisma.contractLine.findUnique({
    where: { id: parsed.data.contractLineId },
    include: { contract: { include: { site: true } } },
  });
  if (!line || line.contract.supplierId !== user.entityId) {
    return { ok: false, error: "That contract line is not on your account." };
  }

  const remaining = line.quantityTotal - line.quantityClaimed;
  if (parsed.data.quantity > remaining) {
    return {
      ok: false,
      error: `That is ${parsed.data.quantity - remaining} ${line.unit} more than the contract balance of ${remaining}. Reduce the quantity or raise a variation with the buyer.`,
    };
  }

  const existing = await prisma.evidence.findMany({ select: { sha256: true } });
  const submittedAt = new Date();
  const checks = runEdgeChecks({
    submitted: { lat: parsed.data.lat, lng: parsed.data.lng },
    evidence: parsed.data.evidence.map((item) => ({
      sha256: item.sha256,
      exifLat: item.exifLat,
      exifLng: item.exifLng,
      capturedAt: item.capturedAt ? new Date(item.capturedAt) : null,
    })),
    quantity: parsed.data.quantity,
    remainingBalance: remaining,
    submittedAt,
    existingHashes: new Set(existing.map((row) => row.sha256)),
  });

  const resolved = await resolveSiteAndReviewer({
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });
  const flagged = hasHardFail(checks) || !resolved.resolution;
  const status = flagged ? "FLAGGED" : "QUEUED";
  const ref = await nextClaimRef();

  const claim = await prisma.claim.create({
    data: {
      ref,
      contractId: line.contractId,
      contractLineId: line.id,
      entityId: user.entityId,
      submittedById: user.id,
      siteId: resolved.resolution?.site.id ?? line.contract.siteId,
      quantity: parsed.data.quantity,
      note: parsed.data.note,
      channel: parsed.data.channel,
      submittedLat: parsed.data.lat,
      submittedLng: parsed.data.lng,
      resolvedNodeId: resolved.resolution?.site.nodeId,
      driftMeters: resolved.resolution?.driftMeters ?? null,
      submittedAt,
      status,
      evidence: {
        create: parsed.data.evidence.map((item) => ({
          kind: "PHOTO",
          url: item.url,
          sha256: item.sha256,
          exifLat: item.exifLat,
          exifLng: item.exifLng,
          capturedAt: item.capturedAt ? new Date(item.capturedAt) : null,
          deviceHint: item.deviceHint ?? "Web",
        })),
      },
      edgeChecks: {
        create: checks.map((check) => ({
          check: check.check,
          passed: check.passed,
          detail: !resolved.resolution
            ? "Submission is not near any known site"
            : check.detail,
        })),
      },
    },
  });

  await prisma.contractLine.update({
    where: { id: line.id },
    data: { quantityClaimed: { increment: parsed.data.quantity } },
  });

  revalidatePath("/console");
  revalidatePath("/console/claims");
  revalidatePath("/review");
  revalidatePath("/intelligence");
  return { ok: true, data: { id: claim.id, ref: claim.ref, status: claim.status } };
}

export async function decideClaim(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  const parsed = decideSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Choose a decision.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.decision !== "APPROVE" && !parsed.data.comment) {
    return { ok: false, error: "A comment is required to query or reject." };
  }
  const session = await getSession();
  const claim = await prisma.claim.findUnique({
    where: { id: parsed.data.claimId },
    include: { edgeChecks: true, evidence: true, contractLine: true, reviews: true },
  });
  if (!claim) return { ok: false, error: "Claim not found." };

  const decidedAt = new Date();
  await prisma.review.create({
    data: {
      claimId: claim.id,
      reviewerId: session.userId,
      decision: parsed.data.decision,
      comment: parsed.data.comment,
      decidedAt,
    },
  });

  if (parsed.data.decision === "QUERY") {
    await prisma.claim.update({ where: { id: claim.id }, data: { status: "QUERIED" } });
  } else if (parsed.data.decision === "REJECT") {
    await prisma.claim.update({ where: { id: claim.id }, data: { status: "REJECTED" } });
    await prisma.contractLine.update({
      where: { id: claim.contractLineId },
      data: { quantityClaimed: { decrement: claim.quantity } },
    });
  } else {
    const entity = await prisma.entity.findUnique({ where: { id: claim.entityId } });
    const hours = (decidedAt.getTime() - claim.submittedAt.getTime()) / 36e5;
    const value = computeValueOutcome({
      claimRef: claim.ref,
      quantity: claim.quantity,
      unitRate: claim.contractLine.unitRate,
      edgeChecks: claim.edgeChecks.map((row) => ({
        check: row.check as "exif_gps_match",
        passed: row.passed,
        detail: row.detail,
        hard: row.check !== "exif_gps_match",
        soft: row.check === "exif_gps_match" && row.detail.includes("No EXIF"),
      })),
      driftMeters: claim.driftMeters,
      approvedWithinHours: hours,
      entityReliability: entity?.reliability ?? null,
      previouslyQueried: claim.reviews.some((r) => r.decision === "QUERY") || claim.status === "QUERIED",
      evidenceHashes: claim.evidence.map((row) => row.sha256),
      reviewerId: session.userId,
      decidedAt,
    });
    await prisma.valueOutcome.create({
      data: {
        claimId: claim.id,
        proofSetHash: value.proofSetHash,
        baseAmount: value.baseAmount,
        qualityMultiplier: value.qualityMultiplier,
        grossAmount: value.grossAmount,
        supplierShare: value.supplierShare,
        platformShare: value.platformShare,
        welfareShare: value.welfareShare,
        policyVersion: value.policyVersion,
        computedAt: decidedAt,
        settlement: {
          create: {
            instrument: "MPESA_B2C",
            reference: `MPX${claim.ref.replace(/\W/g, "").slice(-8)}`,
            status: "SETTLED",
            settledAt: decidedAt,
          },
        },
      },
    });
    await prisma.claim.update({ where: { id: claim.id }, data: { status: "SETTLED" } });
    await recomputeReliability(claim.entityId);
  }

  revalidatePath("/review");
  revalidatePath(`/review/${claim.id}`);
  revalidatePath(`/console/claims/${claim.id}`);
  revalidatePath("/console");
  revalidatePath("/intelligence");
  revalidatePath(`/registry`);
  return { ok: true, data: { id: claim.id, status: parsed.data.decision } };
}

export async function respondToQuery(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const schema = z.object({
    claimId: z.string(),
    comment: z.string().min(1).max(400),
    evidence: z.array(evidenceSchema).optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Add a response to the query." };
  }
  const claim = await prisma.claim.findUnique({ where: { id: parsed.data.claimId } });
  if (!claim || claim.status !== "QUERIED") {
    return { ok: false, error: "This claim is not waiting on a response." };
  }
  if (parsed.data.evidence) {
    await prisma.evidence.createMany({
      data: parsed.data.evidence.map((item) => ({
        claimId: claim.id,
        kind: "PHOTO",
        url: item.url,
        sha256: item.sha256,
        exifLat: item.exifLat,
        exifLng: item.exifLng,
        capturedAt: item.capturedAt ? new Date(item.capturedAt) : null,
        deviceHint: item.deviceHint ?? "Web",
      })),
    });
  }
  await prisma.claim.update({
    where: { id: claim.id },
    data: { status: "QUEUED", note: parsed.data.comment },
  });
  revalidatePath("/review");
  revalidatePath(`/console/claims/${claim.id}`);
  return { ok: true, data: { id: claim.id } };
}

export async function batchApprove(
  input: unknown,
): Promise<ActionResult<{ approved: number }>> {
  const parsed = z.object({ claimIds: z.array(z.string()).min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Select at least one claim." };
  const claims = await prisma.claim.findMany({
    where: { id: { in: parsed.data.claimIds } },
    include: { edgeChecks: true },
  });
  const blocked = claims.some((claim) => claim.edgeChecks.some((check) => !check.passed && check.check !== "exif_gps_match"));
  if (blocked) {
    return { ok: false, error: "Batch approve is blocked when any selected claim has a failed hard check." };
  }
  for (const claim of claims) {
    const result = await decideClaim({ claimId: claim.id, decision: "APPROVE" });
    if (!result.ok) return result;
  }
  return { ok: true, data: { approved: claims.length } };
}
