import type { EntityCategory, Prisma, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { parseStringArray } from "@/lib/json";
import { computeReliability, isCompletedStatus, type ScoreClaim } from "@/lib/scoring";

export type RegistryQuery = {
  q?: string;
  category?: string[];
  county?: string[];
  verification?: string[];
  ownership?: string[];
  minReliability?: number;
  hasDeliveries?: boolean;
  sort?: "reliability" | "deliveries" | "verified" | "name";
  page?: number;
  limit?: number;
};

export function parseList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function searchEntities(query: RegistryQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = query.limit ?? PAGE_SIZE;
  const where: Prisma.EntityWhereInput = {};

  if (query.q) {
    where.OR = [
      { legalName: { contains: query.q } },
      { tradingName: { contains: query.q } },
      { subcategories: { contains: query.q } },
    ];
  }
  if (query.category && query.category.length > 0) {
    where.category = { in: query.category as EntityCategory[] };
  }
  if (query.county && query.county.length > 0) {
    where.countyCode = { in: query.county };
  }
  if (query.verification && query.verification.length > 0) {
    where.verification = { in: query.verification as VerificationStatus[] };
  }
  if (query.minReliability != null && query.minReliability > 0) {
    where.reliability = { gte: query.minReliability };
  }
  if (query.hasDeliveries) {
    where.claims = { some: {} };
  }

  const [rows, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      include: {
        certifications: { orderBy: { expiresAt: "asc" } },
        _count: { select: { claims: true } },
      },
      orderBy:
        query.sort === "name"
          ? { legalName: "asc" }
          : query.sort === "deliveries"
            ? { claims: { _count: "desc" } }
            : query.sort === "verified"
              ? { createdAt: "desc" }
              : { reliability: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.entity.count({ where }),
  ]);

  const filtered = query.ownership && query.ownership.length > 0
    ? rows.filter((row) => {
        const tags = parseStringArray(row.ownershipTags);
        return query.ownership?.some((tag) => tags.includes(tag));
      })
    : rows;

  const [verified, counties, claims] = await Promise.all([
    prisma.entity.count({ where: { ...where, verification: "VERIFIED" } }),
    prisma.entity.findMany({
      where,
      select: { countyCode: true },
      distinct: ["countyCode"],
    }),
    prisma.claim.count({
      where: query.county && query.county.length > 0
        ? { site: { countyCode: { in: query.county } } }
        : {},
    }),
  ]);

  return {
    rows: filtered,
    total: query.ownership && query.ownership.length > 0 ? filtered.length : total,
    page,
    limit,
    counters: {
      entities: query.ownership && query.ownership.length > 0 ? filtered.length : total,
      verified,
      counties: counties.length,
      claims,
    },
  };
}

export async function getEntityBySlug(slug: string) {
  return prisma.entity.findUnique({
    where: { slug },
    include: {
      certifications: { orderBy: { expiresAt: "asc" } },
      claims: {
        include: {
          site: true,
          contractLine: true,
          valueOutcome: true,
          contract: true,
        },
        orderBy: { submittedAt: "desc" },
      },
      relationshipsFrom: { include: { to: { include: { _count: { select: { claims: true } } } } } },
      relationshipsTo: { include: { from: { include: { _count: { select: { claims: true } } } } } },
      users: true,
    },
  });
}

export async function scoreForEntity(entityId: string) {
  const claims = await prisma.claim.findMany({
    where: { entityId },
    include: { edgeChecks: true, reviews: true, site: true },
    orderBy: { submittedAt: "desc" },
  });
  const mapped: ScoreClaim[] = claims.map((claim) => ({
    status: claim.status,
    submittedAt: claim.submittedAt,
    queried: claim.reviews.some((r) => r.decision === "QUERY") || claim.status === "QUERIED",
    rejected: claim.status === "REJECTED",
    allChecksPassedFirstTime: claim.edgeChecks.length === 4 && claim.edgeChecks.every((c) => c.passed),
    completed: isCompletedStatus(claim.status),
  }));
  const sites = new Set(claims.map((c) => c.siteId)).size;
  const since = claims.at(-1)?.submittedAt ?? null;
  return computeReliability(mapped, sites, since);
}
