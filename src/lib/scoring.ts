import { MIN_RELIABILITY_HISTORY } from "@/lib/constants";
import type { ClaimStatus, ScoreBreakdown } from "@/types";

export type ScoreClaim = {
  status: ClaimStatus;
  submittedAt: Date;
  queried: boolean;
  rejected: boolean;
  allChecksPassedFirstTime: boolean;
  completed: boolean;
};

export type ReliabilityResult = {
  score: number | null;
  breakdown: ScoreBreakdown;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 1;
  const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
  if (mean === 0) return 1;
  const variance =
    values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function startOfIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function computeReliability(
  claims: ScoreClaim[],
  siteCount: number,
  since: Date | null,
): ReliabilityResult {
  const completed = claims
    .filter((claim) => claim.completed)
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  const breakdown: ScoreBreakdown = {
    onTime: 0,
    evidenceQuality: 0,
    queryRate: 0,
    volumeConsistency: 0,
    completedDeliveries: completed.length,
    siteCount,
    since,
  };

  if (completed.length < MIN_RELIABILITY_HISTORY) {
    return { score: null, breakdown };
  }

  const last20 = completed.slice(0, 20);
  const onTimeShare =
    last20.filter((claim) => !claim.queried && !claim.rejected).length /
    last20.length;

  const evidenceShare =
    completed.filter((claim) => claim.allChecksPassedFirstTime).length /
    completed.length;

  const queriedOrRejectedShare =
    completed.filter((claim) => claim.queried || claim.rejected).length /
    completed.length;
  const queryInverse = 1 - queriedOrRejectedShare;

  const now = completed[0]?.submittedAt ?? new Date();
  const weekCounts: number[] = [];
  const buckets = new Map<string, number>();
  for (const claim of completed) {
    const key = startOfIsoWeek(claim.submittedAt);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  for (let i = 0; i < 12; i += 1) {
    const week = new Date(now);
    week.setUTCDate(week.getUTCDate() - i * 7);
    const key = startOfIsoWeek(week);
    weekCounts.push(buckets.get(key) ?? 0);
  }
  const volume = clamp01(1 - coefficientOfVariation(weekCounts));

  breakdown.onTime = Math.round(onTimeShare * 25);
  breakdown.evidenceQuality = Math.round(evidenceShare * 25);
  breakdown.queryRate = Math.round(queryInverse * 25);
  breakdown.volumeConsistency = Math.round(volume * 25);

  const score = Math.round(
    breakdown.onTime +
      breakdown.evidenceQuality +
      breakdown.queryRate +
      breakdown.volumeConsistency,
  );

  return { score: Math.min(100, Math.max(0, score)), breakdown };
}

export function isCompletedStatus(status: ClaimStatus): boolean {
  return status === "APPROVED" || status === "SETTLED";
}
