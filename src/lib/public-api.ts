import type { Certification, Entity } from "@prisma/client";
import { ENTITY_CATEGORY_LABELS, countyName } from "@/lib/constants";
import { parseStringArray } from "@/lib/json";

export type PublicEntity = {
  slug: string;
  legalName: string;
  tradingName: string | null;
  category: string;
  county: string;
  countyCode: string;
  verification: string;
  reliability: number | null;
  ownershipTags: string[];
  subcategories: string[];
  yearEstablished: number | null;
  certifications?: {
    authority: string;
    scheme: string;
    class: string | null;
    number: string;
    expiresAt: string | null;
    status: string;
  }[];
  capability?: string[];
  _links: { self: string; html: string };
};

export function toPublicEntity(
  entity: Entity & { certifications?: Certification[] },
  capability: string[] = [],
): PublicEntity {
  return {
    slug: entity.slug,
    legalName: entity.legalName,
    tradingName: entity.tradingName,
    category: ENTITY_CATEGORY_LABELS[entity.category],
    county: countyName(entity.countyCode),
    countyCode: entity.countyCode,
    verification: entity.verification,
    reliability: entity.reliability,
    ownershipTags: parseStringArray(entity.ownershipTags),
    subcategories: parseStringArray(entity.subcategories),
    yearEstablished: entity.yearEstablished,
    certifications: entity.certifications?.map((cert) => ({
      authority: cert.authority,
      scheme: cert.scheme,
      class: cert.class,
      number: cert.number,
      expiresAt: cert.expiresAt?.toISOString() ?? null,
      status: cert.status,
    })),
    capability,
    _links: {
      self: `/api/public/entities/${entity.slug}`,
      html: `/registry/${entity.slug}`,
    },
  };
}
