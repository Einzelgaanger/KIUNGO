import { createHash } from "crypto";
import { POLICY_VERSION } from "@/lib/constants";
import type { EdgeCheckResult } from "@/lib/verification";

export type ValueInputs = {
  claimRef: string;
  quantity: number;
  unitRate: number;
  edgeChecks: EdgeCheckResult[];
  driftMeters: number | null;
  approvedWithinHours: number | null;
  entityReliability: number | null;
  previouslyQueried: boolean;
  evidenceHashes: string[];
  reviewerId: string;
  decidedAt: Date;
  policyVersion?: string;
};

export type ValueComputation = {
  baseAmount: number;
  qualityMultiplier: number;
  adjustments: { label: string; value: number }[];
  grossAmount: number;
  supplierShare: number;
  platformShare: number;
  welfareShare: number;
  proofSetHash: string;
  policyVersion: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeValueOutcome(input: ValueInputs): ValueComputation {
  const policyVersion = input.policyVersion ?? POLICY_VERSION;
  const baseAmount = Math.round(input.quantity * input.unitRate);
  const adjustments: { label: string; value: number }[] = [];

  const allPassed = input.edgeChecks.length === 4 && input.edgeChecks.every((c) => c.passed);
  if (allPassed) adjustments.push({ label: "All four edge checks passed", value: 0.05 });

  if (input.driftMeters != null && input.driftMeters <= 100) {
    adjustments.push({ label: "Drift within 100 m", value: 0.03 });
  }

  if (input.approvedWithinHours != null && input.approvedWithinHours <= 24) {
    adjustments.push({ label: "Reviewed within 24 hours", value: 0.02 });
  }

  if (input.entityReliability != null && input.entityReliability >= 80) {
    adjustments.push({ label: "Reliability 80 or above", value: 0.05 });
  }

  const softFlag = input.edgeChecks.some((c) => c.soft);
  if (softFlag) adjustments.push({ label: "Soft flag present", value: -0.05 });

  if (input.previouslyQueried) {
    adjustments.push({ label: "Previously queried and resubmitted", value: -0.1 });
  }

  const raw = 1 + adjustments.reduce((sum, item) => sum + item.value, 0);
  const qualityMultiplier = clamp(Math.round(raw * 100) / 100, 0.85, 1.15);
  const grossAmount = Math.round(baseAmount * qualityMultiplier);
  const supplierShare = Math.round(grossAmount * 0.8);
  const platformShare = Math.round(grossAmount * 0.1);
  const welfareShare = grossAmount - supplierShare - platformShare;

  const proofPayload = {
    claimRef: input.claimRef,
    quantity: input.quantity,
    evidenceHashes: [...input.evidenceHashes].sort(),
    edgeCheckResults: input.edgeChecks.map((c) => ({
      check: c.check,
      passed: c.passed,
    })),
    reviewerId: input.reviewerId,
    decidedAt: input.decidedAt.toISOString(),
    policyVersion,
  };

  const proofSetHash = createHash("sha256")
    .update(JSON.stringify(proofPayload))
    .digest("hex");

  return {
    baseAmount,
    qualityMultiplier,
    adjustments,
    grossAmount,
    supplierShare,
    platformShare,
    welfareShare,
    proofSetHash,
    policyVersion,
  };
}
