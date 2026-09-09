import type { EntityCategory, OwnershipTag } from "@/types";

export type MatchEntity = {
  countyCode: string;
  category: EntityCategory;
  ownershipTags: OwnershipTag[];
  reliability: number | null;
};

export type MatchOpportunity = {
  countyCode: string;
  category: EntityCategory;
  reservedFor: OwnershipTag[];
  minReliability?: number;
};

export type MatchResult = {
  score: number;
  reasons: string[];
};

export function scoreOpportunityMatch(
  entity: MatchEntity,
  opportunity: MatchOpportunity,
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  if (entity.countyCode === opportunity.countyCode) {
    score += 3;
    reasons.push("Same county as the opportunity");
  }
  if (entity.category === opportunity.category) {
    score += 3;
    reasons.push("Category matches the package");
  }
  const reservedHit = opportunity.reservedFor.filter((tag) =>
    entity.ownershipTags.includes(tag),
  );
  if (reservedHit.length > 0) {
    score += 4;
    reasons.push(`Reserved-for match: ${reservedHit.join(", ")}`);
  }
  const threshold = opportunity.minReliability ?? 0;
  if (entity.reliability != null && entity.reliability >= threshold && threshold > 0) {
    score += 2;
    reasons.push(`Reliability ${entity.reliability} is above the threshold`);
  } else if (threshold === 0 && entity.reliability != null && entity.reliability >= 65) {
    score += 2;
    reasons.push("Reliability is above the working threshold");
  }

  return { score, reasons };
}
