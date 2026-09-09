import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import {
  PrismaClient,
  type ClaimStatus,
  type EntityCategory,
  type Prisma,
  type VerificationStatus,
} from "@prisma/client";
import {
  BULK_ITEM_CODES,
  FABRICATOR_ITEM_CODES,
  ITEM_CATALOGUE,
  SEEDED_COUNTY_CODES,
  SITES,
} from "../src/lib/constants";
import { offsetLatLng } from "../src/lib/geo";
import { computeReliability, isCompletedStatus, type ScoreClaim } from "../src/lib/scoring";
import { computeValueOutcome } from "../src/lib/value-engine";
import { runEdgeChecks, type EdgeCheckResult } from "../src/lib/verification";
import { FIRST_NAMES, LAST_NAMES, PLACES, PUBLIC_BODIES, SUFFIXES, TRADES, WARDS } from "./seed-data/names";
import { Rng } from "./seed-data/rng";
import { writeMockPhotos } from "./seed-data/write-photos";

const prisma = new PrismaClient();
const NOW = new Date("2026-09-09T12:00:00.000Z");
const SEED = 20260909;

const CATEGORY_COUNTS: Record<EntityCategory, number> = {
  FABRICATOR: 50,
  MANUFACTURER: 17,
  DISTRIBUTOR: 23,
  CONTRACTOR: 20,
  DEVELOPER: 6,
  PROFESSIONAL: 22,
  TRADE: 18,
  FINANCIER: 6,
  INSURER: 3,
  LOGISTICS: 7,
  PUBLIC_BODY: 8,
};

const STATUS_COUNTS: Record<ClaimStatus, number> = {
  SETTLED: 468,
  APPROVED: 108,
  QUEUED: 126,
  SUBMITTED: 40,
  EDGE_CHECKED: 41,
  QUERIED: 54,
  FLAGGED: 36,
  REJECTED: 27,
  DRAFT: 0,
};

type FinanceProductSeed = {
  providerName: string;
  productName: string;
  kind: "INVOICE_DISCOUNT" | "ASSET_FINANCE" | "STOCK_CREDIT" | "MORTGAGE" | "INSURANCE";
  minAmount: number;
  maxAmount: number;
  ratePctAnnual: number;
  tenorMonths: number;
  minReliability: number;
  requiresVerified: boolean;
  blurb: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function catalogueByCode(code: string) {
  const item = ITEM_CATALOGUE.find((row) => row.code === code);
  if (!item) throw new Error(`Unknown item ${code}`);
  return item;
}

function itemsForCategory(category: EntityCategory) {
  if (category === "FABRICATOR" || category === "TRADE") {
    return ITEM_CATALOGUE.filter((item) =>
      (FABRICATOR_ITEM_CODES as readonly string[]).includes(item.code),
    );
  }
  if (category === "PROFESSIONAL") {
    return ITEM_CATALOGUE.filter((item) => item.code === "DR-STL-900" || item.code === "WIN-AL-1212");
  }
  return ITEM_CATALOGUE.filter((item) => (BULK_ITEM_CODES as readonly string[]).includes(item.code));
}

async function main() {
  const rng = new Rng(SEED);
  const photos = writeMockPhotos();

  await prisma.$transaction([
    prisma.settlement.deleteMany(),
    prisma.valueOutcome.deleteMany(),
    prisma.review.deleteMany(),
    prisma.edgeCheck.deleteMany(),
    prisma.evidence.deleteMany(),
    prisma.claim.deleteMany(),
    prisma.contractLine.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.financeApplication.deleteMany(),
    prisma.financeProduct.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.materialPrice.deleteMany(),
    prisma.relationship.deleteMany(),
    prisma.certification.deleteMany(),
    prisma.site.deleteMany(),
    prisma.programme.deleteMany(),
    prisma.user.deleteMany(),
    prisma.entity.deleteMany(),
    prisma.node.deleteMany(),
  ]);

  const national = await prisma.node.create({
    data: {
      id: "node-national",
      name: "Kenya",
      level: "NATIONAL",
      code: "KE",
      lat: 0.0236,
      lng: 37.9062,
    },
  });

  const countyNodes = new Map<string, string>();
  for (const code of SEEDED_COUNTY_CODES) {
    const names: Record<string, string> = {
      "047": "Nairobi",
      "022": "Kiambu",
      "016": "Machakos",
      "034": "Kajiado",
      "032": "Nakuru",
      "042": "Kisumu",
      "001": "Mombasa",
      "027": "Uasin Gishu",
    };
    const node = await prisma.node.create({
      data: {
        id: `node-county-${code}`,
        name: `${names[code] ?? code} County`,
        level: "COUNTY",
        code: `CTY-${code}`,
        parentId: national.id,
      },
    });
    countyNodes.set(code, node.id);
  }

  const wardNodes = new Map<string, string>();
  for (const ward of WARDS) {
    const parentId = countyNodes.get(ward.countyCode);
    if (!parentId) continue;
    const node = await prisma.node.create({
      data: {
        id: ward.id,
        name: ward.name,
        level: "WARD",
        code: ward.id.replace("node-", "").toUpperCase(),
        parentId,
      },
    });
    wardNodes.set(ward.id, node.id);
  }

  const programme = await prisma.programme.create({
    data: {
      id: "prog-ahp",
      name: "Affordable Housing Programme",
      code: "AHP",
      owner: "Affordable Housing Board",
    },
  });

  const siteWard: Record<string, string> = {
    "mukuru-phase-2": "node-ward-embakasi-south",
    "starehe-block-c": "node-ward-starehe",
    "kajiado-mashuuru": "node-ward-mashuuru",
    "nakuru-bondeni": "node-ward-bondeni",
    "kisumu-lumumba": "node-ward-lumumba",
    "machakos-stoni-athi": "node-ward-stoni-athi",
  };

  for (const site of SITES) {
    const wardId = siteWard[site.slug];
    if (!wardId) throw new Error(`No ward for ${site.slug}`);
    const siteNode = await prisma.node.create({
      data: {
        id: `node-${site.id}`,
        name: site.name,
        level: "SITE",
        code: `SITE-${site.slug.toUpperCase()}`,
        parentId: wardId,
        lat: site.lat,
        lng: site.lng,
      },
    });
    await prisma.site.create({
      data: {
        id: site.id,
        slug: site.slug,
        name: site.name,
        programmeId: programme.id,
        nodeId: siteNode.id,
        countyCode: site.countyCode,
        lat: site.lat,
        lng: site.lng,
        geofenceM: site.geofenceM,
        unitsPlanned: site.unitsPlanned,
        unitsComplete: Math.round(site.unitsPlanned * (site.slug.includes("mukuru") || site.slug.includes("nakuru") ? 0.28 : 0.16)),
        startedAt: new Date(site.startedAt),
        targetAt: new Date(site.targetAt),
      },
    });
  }

  const entities: Prisma.EntityCreateManyInput[] = [];
  const usedSlugs = new Set<string>();

  function pushEntity(row: Prisma.EntityCreateManyInput) {
    if (usedSlugs.has(row.slug)) return;
    usedSlugs.add(row.slug);
    entities.push(row);
  }

  pushEntity({
    id: "ent-kariobangi-metal-works",
    slug: "kariobangi-metal-works",
    legalName: "Kariobangi Metal Works Ltd",
    tradingName: "Kariobangi Metal Works",
    registrationNo: "PVT-2021-08421",
    category: "FABRICATOR",
    subcategories: JSON.stringify(["doors", "windows", "frames"]),
    countyCode: "047",
    ward: "Embakasi South",
    lat: -1.263,
    lng: 36.884,
    contactName: "Amina Wanjiru",
    contactPhone: "+254712000001",
    contactEmail: "amina@kariobangi-metal.example",
    sizeBand: "SMALL",
    ownershipTags: JSON.stringify(["YOUTH", "WOMEN", "JUA_KALI"]),
    yearEstablished: 2018,
    description: "Youth- and women-led metal fabricator supplying steel door frames and windows to AHP sites in Nairobi.",
    verification: "VERIFIED",
  });

  pushEntity({
    id: "ent-kondele-fabricators",
    slug: "kondele-fabricators",
    legalName: "Kondele Fabricators Self-Help Group",
    tradingName: "Kondele Fabricators",
    registrationNo: "SHG-KSM-2019-441",
    category: "FABRICATOR",
    subcategories: JSON.stringify(["doors", "frames"]),
    countyCode: "042",
    ward: "Kondele",
    lat: -0.09,
    lng: 34.772,
    contactName: "Peter Otieno",
    contactPhone: "+254712000002",
    contactEmail: "peter@kondele-fab.example",
    sizeBand: "MICRO",
    ownershipTags: JSON.stringify(["YOUTH", "JUA_KALI"]),
    yearEstablished: 2019,
    description: "Kondele self-help group fabricating door frames. Verification is still pending with MSEA.",
    verification: "PENDING",
  });

  pushEntity({
    id: "ent-sample-builders-group",
    slug: "sample-builders-group",
    legalName: "Sample Builders Group Ltd",
    registrationNo: "PVT-2016-11092",
    category: "CONTRACTOR",
    subcategories: JSON.stringify(["building-works"]),
    countyCode: "047",
    ward: "Embakasi South",
    lat: -1.292,
    lng: 36.86,
    contactName: "Grace Njeri",
    contactPhone: "+254712000003",
    contactEmail: "grace@sample-builders.example",
    sizeBand: "MEDIUM",
    ownershipTags: JSON.stringify(["WOMEN"]),
    yearEstablished: 2014,
    description: "Main contractor on Mukuru Phase 2 and Starehe Point Block C.",
    verification: "VERIFIED",
  });

  pushEntity({
    id: "ent-sample-bank-a",
    slug: "sample-bank-a",
    legalName: "Sample Bank A",
    registrationNo: "CBK-BANK-A",
    category: "FINANCIER",
    subcategories: JSON.stringify(["invoice-discount", "mortgage"]),
    countyCode: "047",
    ward: "Westlands",
    lat: -1.268,
    lng: 36.811,
    contactName: "Samuel Barasa",
    contactPhone: "+254712000006",
    contactEmail: "samuel@sample-bank-a.example",
    sizeBand: "LARGE",
    ownershipTags: JSON.stringify([]),
    yearEstablished: 1998,
    description: "Demonstration bank. Not a live partnership.",
    verification: "VERIFIED",
  });

  for (const body of PUBLIC_BODIES) {
    pushEntity({
      id: body.id,
      slug: body.slug,
      legalName: body.legalName,
      category: "PUBLIC_BODY",
      subcategories: JSON.stringify(["regulation"]),
      countyCode: body.countyCode,
      contactName: "Registry desk",
      contactPhone: "+254200000000",
      contactEmail: `desk@${body.slug}.go.ke.example`,
      sizeBand: "LARGE",
      ownershipTags: JSON.stringify([]),
      yearEstablished: 2010,
      description: `${body.legalName} appears here as a public-body registry record.`,
      verification: "VERIFIED",
    });
  }

  const financierNames = [
    "Sample Bank B",
    "Sample Bank C",
    "Sample SACCO",
    "Sample MFI",
    "Sample Housing Finance",
  ];
  financierNames.forEach((name, i) => {
    pushEntity({
      id: `ent-financier-${i + 1}`,
      slug: slugify(name),
      legalName: name,
      category: "FINANCIER",
      subcategories: JSON.stringify(["credit"]),
      countyCode: rng.pick([...SEEDED_COUNTY_CODES]),
      sizeBand: "LARGE",
      ownershipTags: JSON.stringify([]),
      yearEstablished: 2000 + i,
      description: `${name} is a fictional provider used only in this demonstration.`,
      verification: "VERIFIED",
    });
  });

  ["Sample Insurer", "Sample General Insurance", "Sample Bond Underwriters"].forEach((name, i) => {
    pushEntity({
      id: `ent-insurer-${i + 1}`,
      slug: slugify(name),
      legalName: name,
      category: "INSURER",
      subcategories: JSON.stringify(["contractors-all-risk"]),
      countyCode: "047",
      sizeBand: "LARGE",
      ownershipTags: JSON.stringify([]),
      yearEstablished: 2005,
      description: `${name} is a fictional insurer used only in this demonstration.`,
      verification: "VERIFIED",
    });
  });

  const remaining = { ...CATEGORY_COUNTS };
  for (const row of entities) {
    remaining[row.category] -= 1;
  }

  const sizeBands = ["MICRO", "SMALL", "MEDIUM", "LARGE"] as const;
  let generated = 0;
  while (entities.length < 180) {
    const open = (Object.keys(remaining) as EntityCategory[]).filter((key) => remaining[key] > 0);
    if (open.length === 0) break;
    const category = rng.pick(open);
    const place = rng.pick(PLACES);
    const trade = rng.pick(TRADES);
    const suffix = rng.pick(SUFFIXES);
    const legalName = `${place} ${trade} ${suffix}`;
    const slug = slugify(legalName);
    if (usedSlugs.has(slug)) continue;
    remaining[category] -= 1;
    generated += 1;

    const tags: string[] = [];
    if (category === "FABRICATOR" || category === "TRADE") {
      if (rng.chance(0.34)) tags.push("YOUTH");
      if (rng.chance(0.28)) tags.push("WOMEN");
      if (rng.chance(0.04)) tags.push("PWD");
      if (rng.chance(0.62)) tags.push("JUA_KALI");
    } else if (rng.chance(0.2)) {
      tags.push(rng.pick(["YOUTH", "WOMEN"] as const));
    }

    const countyCode = rng.pick([...SEEDED_COUNTY_CODES]);
    pushEntity({
      id: `ent-gen-${pad(generated, 3)}`,
      slug,
      legalName,
      tradingName: `${place} ${trade}`,
      registrationNo: `PVT-${2014 + rng.int(0, 11)}-${pad(rng.int(1, 99999), 5)}`,
      category,
      subcategories: JSON.stringify(
        itemsForCategory(category).slice(0, rng.int(1, 3)).map((item) => item.itemName.toLowerCase()),
      ),
      countyCode,
      ward: WARDS.find((w) => w.countyCode === countyCode)?.name,
      lat: -1.3 + rng.float() * 1.4,
      lng: 34.7 + rng.float() * 5,
      contactName: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
      contactPhone: `+2547${pad(rng.int(10000000, 99999999), 8)}`,
      contactEmail: `desk@${slug}.example`,
      sizeBand: rng.pick(sizeBands),
      ownershipTags: JSON.stringify(tags),
      yearEstablished: rng.int(2008, 2024),
      description: `${legalName} supplies ${category.toLowerCase()} work into the Affordable Housing Programme corridor.`,
      verification: "UNVERIFIED",
    });
  }

  const verificationPool = entities.filter(
    (row) =>
      row.id !== "ent-kariobangi-metal-works" &&
      row.id !== "ent-kondele-fabricators" &&
      row.category !== "PUBLIC_BODY" &&
      row.category !== "FINANCIER" &&
      row.category !== "INSURER",
  );
  rng.shuffle(verificationPool);
  const quotas: { status: VerificationStatus; count: number }[] = [
    { status: "VERIFIED", count: 110 },
    { status: "PENDING", count: 32 },
    { status: "UNVERIFIED", count: 25 },
    { status: "EXPIRED", count: 9 },
    { status: "SUSPENDED", count: 4 },
  ];
  const already = new Map<VerificationStatus, number>();
  for (const row of entities) {
    const status = row.verification as VerificationStatus;
    already.set(status, (already.get(status) ?? 0) + 1);
  }
  let cursor = 0;
  for (const quota of quotas) {
    const need = quota.count - (already.get(quota.status) ?? 0);
    for (let i = 0; i < need; i += 1) {
      const row = verificationPool[cursor];
      cursor += 1;
      if (!row) break;
      row.verification = quota.status;
    }
  }

  await prisma.entity.createMany({ data: entities });

  const certs: Prisma.CertificationCreateManyInput[] = [];
  let certN = 0;
  let expiringSoon = 0;
  let expiredCerts = 0;
  for (const entity of entities) {
    if (entity.verification === "UNVERIFIED") continue;
    const count = entity.verification === "VERIFIED" ? rng.int(1, 2) : 1;
    for (let i = 0; i < count; i += 1) {
      certN += 1;
      const authority =
        entity.category === "CONTRACTOR"
          ? "NCA"
          : entity.category === "PROFESSIONAL"
            ? rng.pick(["BORAQS", "EBK"] as const)
            : entity.category === "FABRICATOR" || entity.category === "MANUFACTURER"
              ? rng.pick(["KEBS", "MSEA"] as const)
              : rng.pick(["County", "AGPO"] as const);
      const schemes: Record<string, string> = {
        NCA: "Contractor Registration",
        BORAQS: "Architect / QS Registration",
        EBK: "Professional Engineer",
        KEBS: "Standardisation Mark",
        MSEA: "MSE Formalisation Certificate",
        AGPO: "Reserved Procurement Certificate",
        County: "Single Business Permit",
      };
      let status: VerificationStatus = entity.verification === "PENDING" ? "PENDING" : "VERIFIED";
      let expiresAt = addDays(NOW, rng.int(90, 700));
      if (entity.verification === "EXPIRED" && expiredCerts < 6) {
        status = "EXPIRED";
        expiresAt = addDays(NOW, -rng.int(20, 200));
        expiredCerts += 1;
      } else if (status === "VERIFIED" && expiringSoon < 12) {
        expiresAt = addDays(NOW, rng.int(10, 55));
        expiringSoon += 1;
      }
      certs.push({
        id: `cert-${pad(certN, 4)}`,
        entityId: entity.id as string,
        authority,
        scheme: schemes[authority] ?? "Registration",
        class:
          authority === "NCA"
            ? `NCA ${rng.int(1, 8)} — Building Works`
            : authority === "KEBS"
              ? `SM permit — ${rng.pick(ITEM_CATALOGUE).itemName}`
              : authority === "AGPO"
                ? rng.pick(["Youth", "Women", "PWD"] as const)
                : authority === "County"
                  ? `SBP ${entity.countyCode}`
                  : authority === "BORAQS"
                    ? rng.pick(["Registered Architect", "Registered QS"] as const)
                    : "Professional Engineer",
        number:
          authority === "NCA"
            ? `NCA/CR/${rng.int(2019, 2025)}/${pad(rng.int(1, 99999), 6)}`
            : authority === "BORAQS"
              ? `BORAQS/A/${rng.int(2016, 2024)}/${pad(rng.int(1, 9999), 4)}`
              : authority === "AGPO"
                ? `AGPO/Y/${entity.countyCode}/${rng.int(2023, 2025)}/${pad(rng.int(1, 99999), 5)}`
                : `${authority}/${rng.int(2020, 2025)}/${pad(rng.int(1, 99999), 5)}`,
        issuedAt: addDays(expiresAt, -365 * rng.int(1, 3)),
        expiresAt,
        status,
        lastCheckedAt: addDays(NOW, -rng.int(0, 20)),
      });
    }
  }
  await prisma.certification.createMany({ data: certs });

  const users: Prisma.UserCreateManyInput[] = [
    { id: "user-amina", name: "Amina Wanjiru", phone: "+254712000001", email: "amina@kiungo.example", role: "SUPPLIER", entityId: "ent-kariobangi-metal-works", nodeId: "node-ward-embakasi-south", avatarSeed: "amina" },
    { id: "user-peter", name: "Peter Otieno", phone: "+254712000002", email: "peter@kiungo.example", role: "SUPPLIER", entityId: "ent-kondele-fabricators", nodeId: "node-ward-kondele", avatarSeed: "peter" },
    { id: "user-grace", name: "Grace Njeri", phone: "+254712000003", email: "grace@kiungo.example", role: "CONTRACTOR", entityId: "ent-sample-builders-group", nodeId: "node-site-mukuru-phase-2", avatarSeed: "grace" },
    { id: "user-daniel", name: "Daniel Kiptoo", phone: "+254712000004", email: "daniel@kiungo.example", role: "REVIEWER", entityId: "ent-ahb", nodeId: "node-national", avatarSeed: "daniel" },
    { id: "user-faith", name: "Faith Muthoni", phone: "+254712000005", email: "faith@kiungo.example", role: "PROGRAMME", entityId: "ent-ahb", nodeId: "node-national", avatarSeed: "faith" },
    { id: "user-samuel", name: "Samuel Barasa", phone: "+254712000006", email: "samuel@kiungo.example", role: "FINANCIER", entityId: "ent-sample-bank-a", nodeId: "node-county-047", avatarSeed: "samuel" },
  ];

  const supplierEntities = entities.filter((e) =>
    ["FABRICATOR", "MANUFACTURER", "DISTRIBUTOR", "TRADE"].includes(e.category),
  );
  for (let i = 0; i < 12; i += 1) {
    const entity = supplierEntities[i + 2];
    if (!entity?.id) continue;
    users.push({
      id: `user-supplier-${pad(i + 1, 2)}`,
      name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
      phone: `+254713${pad(100000 + i, 6)}`,
      email: `supplier${i + 1}@kiungo.example`,
      role: "SUPPLIER",
      entityId: entity.id,
      nodeId: `node-county-${entity.countyCode}`,
      avatarSeed: `s${i}`,
    });
  }
  users.push(
    { id: "user-contractor-2", name: "James Mwangi", phone: "+254714000001", email: "james@kiungo.example", role: "CONTRACTOR", entityId: entities.find((e) => e.category === "CONTRACTOR" && e.id !== "ent-sample-builders-group")?.id, nodeId: "node-county-032", avatarSeed: "james" },
    { id: "user-reviewer-2", name: "Lilian Chebet", phone: "+254714000002", email: "lilian@kiungo.example", role: "REVIEWER", entityId: "ent-ahb", nodeId: "node-county-032", avatarSeed: "lilian" },
    { id: "user-reviewer-3", name: "Hassan Omar", phone: "+254714000003", email: "hassan@kiungo.example", role: "REVIEWER", entityId: "ent-nca", nodeId: "node-county-001", avatarSeed: "hassan" },
    { id: "user-programme-2", name: "Mercy Atieno", phone: "+254714000004", email: "mercy@kiungo.example", role: "PROGRAMME", entityId: "ent-state-housing", nodeId: "node-national", avatarSeed: "mercy" },
    { id: "user-financier-2", name: "Brian Koech", phone: "+254714000005", email: "brian@kiungo.example", role: "FINANCIER", entityId: "ent-financier-1", nodeId: "node-county-047", avatarSeed: "brian" },
    { id: "user-citizen", name: "Jane Wairimu", phone: "+254714000006", email: "jane@kiungo.example", role: "CITIZEN", entityId: null, nodeId: "node-county-047", avatarSeed: "jane" },
    { id: "user-admin", name: "Kiungo Admin", phone: "+254714000007", email: "admin@kiungo.example", role: "ADMIN", entityId: "ent-ahb", nodeId: "node-national", avatarSeed: "admin" },
  );
  await prisma.user.createMany({ data: users.slice(0, 24) });

  const buyers = entities.filter((e) => e.category === "CONTRACTOR" || e.category === "DEVELOPER" || e.id === "ent-sample-builders-group");
  const suppliers = entities.filter((e) =>
    ["FABRICATOR", "MANUFACTURER", "DISTRIBUTOR", "TRADE"].includes(e.category),
  );

  const contracts: Prisma.ContractCreateManyInput[] = [];
  const lines: Prisma.ContractLineCreateManyInput[] = [];
  let lineN = 0;

  function addContract(opts: {
    id: string;
    ref: string;
    siteId: string;
    buyerId: string;
    supplierId: string;
    title: string;
    items: string[];
    totals?: number[];
  }) {
    const awardedAt = addDays(NOW, -rng.int(60, 400));
    contracts.push({
      id: opts.id,
      ref: opts.ref,
      siteId: opts.siteId,
      buyerId: opts.buyerId,
      supplierId: opts.supplierId,
      title: opts.title,
      awardedAt,
      expiresAt: addDays(NOW, rng.int(20, 240)),
      status: "ACTIVE",
    });
    opts.items.forEach((code, idx) => {
      const item = catalogueByCode(code);
      lineN += 1;
      lines.push({
        id: `line-${pad(lineN, 4)}`,
        contractId: opts.id,
        itemCode: item.code,
        itemName: item.itemName,
        unit: item.unit,
        quantityTotal: opts.totals?.[idx] ?? rng.int(80, 420),
        quantityClaimed: 0,
        unitRate: item.typicalRate + rng.int(-40, 80),
      });
    });
  }

  addContract({
    id: "con-amina-doors",
    ref: "AHP/MKR/2026/0142",
    siteId: "site-mukuru-phase-2",
    buyerId: "ent-sample-builders-group",
    supplierId: "ent-kariobangi-metal-works",
    title: "Steel door frames — Mukuru Phase 2",
    items: ["DR-STL-900"],
    totals: [400],
  });
  addContract({
    id: "con-amina-shutters",
    ref: "AHP/MKR/2026/0187",
    siteId: "site-mukuru-phase-2",
    buyerId: "ent-sample-builders-group",
    supplierId: "ent-kariobangi-metal-works",
    title: "Flush door shutters — Mukuru Phase 2",
    items: ["DR-FLU-800"],
    totals: [260],
  });
  addContract({
    id: "con-peter-1",
    ref: "AHP/KSM/2026/0031",
    siteId: "site-kisumu-lumumba",
    buyerId: "ent-sample-builders-group",
    supplierId: "ent-kondele-fabricators",
    title: "Door frames — Lumumba Housing Estate",
    items: ["DR-STL-900"],
    totals: [90],
  });

  for (let i = contracts.length; i < 64; i += 1) {
    const site = rng.pick([...SITES]);
    const supplier = rng.pick(suppliers);
    const buyer = rng.pick(buyers);
    if (!supplier.id || !buyer.id) continue;
    const catalogue = itemsForCategory(supplier.category);
    const itemCount = rng.int(2, 4);
    const picked = rng.pickN(catalogue, Math.min(itemCount, catalogue.length));
    addContract({
      id: `con-${pad(i + 1, 3)}`,
      ref: `AHP/${site.slug.slice(0, 3).toUpperCase()}/2026/${pad(200 + i, 4)}`,
      siteId: site.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      title: `${picked[0]?.itemName ?? "Materials"} — ${site.name}`,
      items: picked.map((item) => item.code),
    });
  }

  await prisma.contract.createMany({ data: contracts });
  await prisma.contractLine.createMany({ data: lines });

  const lineByContract = new Map<string, Prisma.ContractLineCreateManyInput[]>();
  for (const line of lines) {
    const list = lineByContract.get(line.contractId) ?? [];
    list.push(line);
    lineByContract.set(line.contractId, list);
  }

  const claimed = new Map<string, number>();
  const claims: Prisma.ClaimCreateManyInput[] = [];
  const evidenceRows: Prisma.EvidenceCreateManyInput[] = [];
  const checkRows: Prisma.EdgeCheckCreateManyInput[] = [];
  const reviewRows: Prisma.ReviewCreateManyInput[] = [];
  const valueRows: Prisma.ValueOutcomeCreateManyInput[] = [];
  const settlementRows: Prisma.SettlementCreateManyInput[] = [];

  const weekWeights: number[] = [];
  for (let w = 0; w < 16; w += 1) {
    weekWeights.push(22 + ((90 - 22) * w) / 15);
  }
  const weightSum = weekWeights.reduce((a, b) => a + b, 0);

  function pickSubmittedAt(index: number, recentQueue: boolean): Date {
    if (recentQueue) {
      return addHours(NOW, -rng.float() * 5 * 24);
    }
    let acc = 0;
    const target = (index / 900) * weightSum;
    let week = 15;
    for (let w = 0; w < 16; w += 1) {
      acc += weekWeights[w] ?? 0;
      if (acc >= target) {
        week = w;
        break;
      }
    }
    const start = addDays(NOW, -16 * 7 + week * 7);
    let day = rng.int(0, 6);
    const roll = rng.float();
    if (roll < 0.04) day = 0;
    else if (roll < 0.12) day = 6;
    else day = rng.int(1, 5);
    const hour = rng.int(7, 17);
    const at = addHours(addDays(start, day), hour);
    return at > NOW ? addHours(NOW, -12) : at;
  }

  const statusList: ClaimStatus[] = [];
  (Object.keys(STATUS_COUNTS) as ClaimStatus[]).forEach((status) => {
    for (let i = 0; i < STATUS_COUNTS[status]; i += 1) statusList.push(status);
  });
  const shuffled = rng.shuffle(statusList);

  function failKind(rngInner: Rng): "gps" | "exif" | "dup" | "qty" {
    const r = rngInner.float();
    if (r < 0.45) return "gps";
    if (r < 0.7) return "exif";
    if (r < 0.88) return "dup";
    return "qty";
  }

  const seenHashes = new Set<string>();
  let claimN = 0;
  const claimMeta: {
    id: string;
    entityId: string;
    siteId: string;
    status: ClaimStatus;
    submittedAt: Date;
    checks: EdgeCheckResult[];
    hashes: string[];
    quantity: number;
    unitRate: number;
    drift: number;
    previouslyQueried: boolean;
    ref: string;
  }[] = [];

  function userForEntity(entityId: string): string {
    const match = users.find((u) => u.entityId === entityId && u.role === "SUPPLIER");
    return match?.id ?? "user-amina";
  }

  for (let i = 0; i < 900; i += 1) {
    claimN += 1;
    const status = shuffled[i] ?? "QUEUED";
    const recent =
      (status === "SUBMITTED" || status === "EDGE_CHECKED" || status === "QUEUED") && i > 820;
    let contract = rng.pick(contracts);
    if (i < 55) {
      contract = rng.chance(0.7) ? contracts[0]! : contracts[1]!;
    }
    if (i >= 55 && i < 57) {
      contract = contracts[2]!;
    }
    const contractId = contract.id;
    if (!contractId) {
      throw new Error("Contract is missing an id");
    }
    const contractLines = lineByContract.get(contractId) ?? [];
    let line = rng.pick(contractLines.length > 0 ? contractLines : lines);
    let already = claimed.get(line.id) ?? 0;
    let remaining = Math.max(0, line.quantityTotal - already);
    if (remaining < 1 && status !== "REJECTED") {
      const alternative = lines.find((row) => (claimed.get(row.id) ?? 0) < row.quantityTotal);
      if (!alternative) {
        break;
      }
      line = alternative;
      already = claimed.get(line.id) ?? 0;
      remaining = Math.max(0, line.quantityTotal - already);
      const altContract = contracts.find((row) => row.id === line.contractId);
      if (altContract) contract = altContract;
    }
    const quantity = Math.max(1, Math.min(remaining, rng.int(4, 40)));
    if (status !== "REJECTED") {
      claimed.set(line.id, already + quantity);
    }

    const site = SITES.find((s) => s.id === contract.siteId) ?? SITES[0]!;
    const submittedAt = pickSubmittedAt(i, recent);
    const drift = rng.int(20, status === "FLAGGED" ? 620 : 180);
    const pin = offsetLatLng({ lat: site.lat, lng: site.lng }, drift, rng.int(-40, 40));
    const photoCount = rng.chance(0.15) ? 2 : 1;
    const hashes: string[] = [];
    const claimId = `claim-${pad(claimN, 4)}`;
    const ref = `CLM-2026-${pad(claimN, 6)}`;
    const fail = status === "FLAGGED" || (rng.float() > 0.92 && status !== "SETTLED" && status !== "APPROVED");
    const kind = fail ? failKind(rng) : null;

    for (let p = 0; p < photoCount; p += 1) {
      let hash = sha(`${claimId}-${p}-${rng.next()}`);
      if (kind === "dup" && p === 0 && seenHashes.size > 0) {
        hash = rng.pick([...seenHashes]);
      } else {
        seenHashes.add(hash);
      }
      hashes.push(hash);
      const capturedAt =
        kind === "exif"
          ? null
          : addHours(submittedAt, kind === null ? -rng.float() * 2 : -rng.int(7, 14));
      const exif =
        kind === "exif"
          ? { lat: null, lng: null }
          : kind === "gps"
            ? offsetLatLng(pin, 260, 40)
            : offsetLatLng(pin, rng.int(-12, 12), rng.int(-12, 12));
      evidenceRows.push({
        id: `ev-${claimId}-${p}`,
        claimId,
        kind: "PHOTO",
        url: rng.pick(photos),
        sha256: hash,
        exifLat: exif.lat,
        exifLng: exif.lng,
        capturedAt,
        deviceHint: rng.pick(["WhatsApp Android", "WhatsApp iOS", "Chrome Mobile"]),
      });
    }

    const checks = runEdgeChecks({
      submitted: pin,
      evidence: evidenceRows
        .filter((row) => row.claimId === claimId)
        .map((row) => ({
          sha256: row.sha256,
          exifLat: row.exifLat,
          exifLng: row.exifLng,
          capturedAt: row.capturedAt ?? null,
        })),
      quantity: kind === "qty" ? line.quantityTotal + 10 : quantity,
      remainingBalance: remaining,
      submittedAt,
      existingHashes: new Set(
        evidenceRows.filter((row) => row.claimId !== claimId).map((row) => row.sha256),
      ),
    });

    checks.forEach((check, idx) => {
      checkRows.push({
        id: `chk-${claimId}-${idx}`,
        claimId,
        check: check.check,
        passed: check.passed,
        detail: check.detail,
        ranAt: addHours(submittedAt, 0.01),
      });
    });

    const qtyUsed = kind === "qty" ? quantity : quantity;
    claims.push({
      id: claimId,
      ref,
      contractId: contract.id,
      contractLineId: line.id,
      entityId: contract.supplierId,
      submittedById: userForEntity(contract.supplierId),
      siteId: contract.siteId,
      quantity: qtyUsed,
      note: rng.chance(0.12) ? "Offloaded at the site store, signed by the clerk." : null,
      channel: rng.pick(["WHATSAPP", "WHATSAPP", "WEB", "USSD"] as const),
      submittedLat: pin.lat,
      submittedLng: pin.lng,
      resolvedNodeId: `node-${contract.siteId}`,
      driftMeters: drift,
      submittedAt,
      flowVersion: "housing.delivery.v1",
      status,
    });

    const previouslyQueried = status === "SETTLED" && rng.chance(0.1);
    claimMeta.push({
      id: claimId,
      entityId: contract.supplierId,
      siteId: contract.siteId,
      status,
      submittedAt,
      checks,
      hashes,
      quantity: qtyUsed,
      unitRate: line.unitRate,
      drift,
      previouslyQueried,
      ref,
    });
  }

  await prisma.claim.createMany({ data: claims });
  for (let i = 0; i < evidenceRows.length; i += 200) {
    await prisma.evidence.createMany({ data: evidenceRows.slice(i, i + 200) });
  }
  for (let i = 0; i < checkRows.length; i += 200) {
    await prisma.edgeCheck.createMany({ data: checkRows.slice(i, i + 200) });
  }

  let reviewN = 0;
  let priorQueries = 0;
  for (const meta of claimMeta) {
    const decided =
      meta.status === "SETTLED" ||
      meta.status === "APPROVED" ||
      meta.status === "QUERIED" ||
      meta.status === "REJECTED" ||
      meta.status === "FLAGGED";
    if (!decided) continue;
    const decision =
      meta.status === "QUERIED"
        ? "QUERY"
        : meta.status === "REJECTED"
          ? "REJECT"
          : meta.status === "FLAGGED"
            ? "QUERY"
            : "APPROVE";
    const decidedAt = addHours(meta.submittedAt, rng.float() * 36 + 1);
    reviewN += 1;
    reviewRows.push({
      id: `rev-${pad(reviewN, 4)}`,
      claimId: meta.id,
      reviewerId: "user-daniel",
      decision,
      comment:
        decision === "APPROVE"
          ? "Evidence matches the contract line and the geofence."
          : decision === "QUERY"
            ? "Please resend a wider shot of the stacked frames with the delivery note visible."
            : "Quantity does not match the site store record.",
      decidedAt,
    });
    if (meta.previouslyQueried && priorQueries < 47) {
      priorQueries += 1;
      reviewN += 1;
      reviewRows.push({
        id: `rev-${pad(reviewN, 4)}`,
        claimId: meta.id,
        reviewerId: "user-daniel",
        decision: "QUERY",
        comment: "First pass: photo did not show the item code.",
        decidedAt: addHours(meta.submittedAt, 8),
      });
    }

    if (meta.status === "SETTLED" || meta.status === "APPROVED") {
      const hours = (decidedAt.getTime() - meta.submittedAt.getTime()) / 36e5;
      const value = computeValueOutcome({
        claimRef: meta.ref,
        quantity: meta.quantity,
        unitRate: meta.unitRate,
        edgeChecks: meta.checks,
        driftMeters: meta.drift,
        approvedWithinHours: hours,
        entityReliability: null,
        previouslyQueried: meta.previouslyQueried,
        evidenceHashes: meta.hashes,
        reviewerId: "user-daniel",
        decidedAt,
        policyVersion: "housing.tariff.v1",
      });
      valueRows.push({
        id: `val-${meta.id}`,
        claimId: meta.id,
        proofSetHash: value.proofSetHash,
        baseAmount: value.baseAmount,
        qualityMultiplier: value.qualityMultiplier,
        grossAmount: value.grossAmount,
        supplierShare: value.supplierShare,
        platformShare: value.platformShare,
        welfareShare: value.welfareShare,
        policyVersion: value.policyVersion,
        computedAt: decidedAt,
      });
      if (meta.status === "SETTLED") {
        settlementRows.push({
          id: `set-${meta.id}`,
          valueOutcomeId: `val-${meta.id}`,
          instrument: "MPESA_B2C",
          reference: `MPX${meta.id.replace("claim-", "").toUpperCase()}`,
          status: "SETTLED",
          settledAt: addHours(decidedAt, 1),
        });
      }
    }
  }

  await prisma.review.createMany({ data: reviewRows });
  await prisma.valueOutcome.createMany({ data: valueRows });
  await prisma.settlement.createMany({ data: settlementRows });

  const claimedFinal = new Map<string, number>();
  for (const claim of claims) {
    if (claim.status === "REJECTED" || claim.status === "DRAFT") continue;
    claimedFinal.set(
      claim.contractLineId,
      (claimedFinal.get(claim.contractLineId) ?? 0) + claim.quantity,
    );
  }
  for (const line of lines) {
    const qty = Math.min(line.quantityTotal, claimedFinal.get(line.id) ?? 0);
    await prisma.contractLine.update({
      where: { id: line.id },
      data: { quantityClaimed: qty },
    });
  }
  await prisma.contractLine.update({
    where: { id: "line-0001" },
    data: { quantityTotal: 400, quantityClaimed: 220 },
  });

  const byEntity = new Map<string, typeof claimMeta>();
  for (const meta of claimMeta) {
    const list = byEntity.get(meta.entityId) ?? [];
    list.push(meta);
    byEntity.set(meta.entityId, list);
  }
  for (const entity of entities) {
    if (!entity.id) continue;
    const rows = byEntity.get(entity.id) ?? [];
    const scoreClaims: ScoreClaim[] = rows.map((row) => ({
      status: row.status,
      submittedAt: row.submittedAt,
      queried: row.status === "QUERIED" || row.previouslyQueried,
      rejected: row.status === "REJECTED",
      allChecksPassedFirstTime: row.checks.every((c) => c.passed),
      completed: isCompletedStatus(row.status),
    }));
    const sites = new Set(rows.map((r) => r.siteId)).size;
    const since = rows.reduce<Date | null>((min, row) => {
      if (!min || row.submittedAt < min) return row.submittedAt;
      return min;
    }, null);
    const result = computeReliability(scoreClaims, sites, since);
    await prisma.entity.update({
      where: { id: entity.id },
      data: { reliability: result.score },
    });
  }

  const rels: Prisma.RelationshipCreateManyInput[] = [];
  const relSeen = new Set<string>();
  for (const contract of contracts) {
    const key = `${contract.supplierId}->${contract.buyerId}`;
    if (relSeen.has(key)) continue;
    relSeen.add(key);
    const volume = claims.filter((c) => c.contractId === contract.id).length;
    rels.push({
      id: `rel-${rels.length + 1}`,
      fromId: contract.supplierId,
      toId: contract.buyerId,
      type: "SUPPLIES_TO",
      since: contract.awardedAt,
      volume,
    });
  }
  await prisma.relationship.createMany({ data: rels });

  const financeProducts = JSON.parse(
    readFileSync(path.join(__dirname, "seed-data", "finance-products.json"), "utf8"),
  ) as FinanceProductSeed[];
  await prisma.financeProduct.createMany({
    data: financeProducts.map((product, i) => ({
      id: `fin-${i + 1}`,
      ...product,
    })),
  });

  await prisma.financeApplication.createMany({
    data: [
      {
        id: "fapp-1",
        productId: "fin-1",
        entityId: "ent-kariobangi-metal-works",
        amount: 420000,
        status: "IN_REVIEW",
        createdAt: addDays(NOW, -12),
      },
    ],
  });

  const oppKinds = ["TENDER", "SUBCONTRACT", "COMPONENT_ORDER", "CITIZEN_REQUEST"] as const;
  const opportunities: Prisma.OpportunityCreateManyInput[] = [];
  for (let i = 0; i < 28; i += 1) {
    const county = rng.pick([...SEEDED_COUNTY_CODES]);
    const reserved = i % 5 === 0 ? ["YOUTH"] : i % 7 === 0 ? ["WOMEN"] : [];
    const closesAt = addDays(NOW, i < 9 ? rng.int(1, 13) : rng.int(15, 60));
    opportunities.push({
      id: `opp-${pad(i + 1, 2)}`,
      ref: `OPP-2026-${pad(i + 41, 4)}`,
      title:
        i % 4 === 0
          ? `Steel door frames for ${SITES[i % SITES.length]?.name}`
          : i % 4 === 1
            ? `Cement and ballast package — ${county}`
            : i % 4 === 2
              ? `Aluminium windows, 200 units`
              : `Citizen request: 3-bedroom finish package`,
      kind: oppKinds[i % 4] ?? "TENDER",
      buyerName: rng.pick(["Sample Builders Group Ltd", "Affordable Housing Board", "County Housing Department", "Household — Nairobi"]),
      countyCode: county,
      category: rng.pick(["FABRICATOR", "MANUFACTURER", "DISTRIBUTOR", "TRADE"] as const),
      reservedFor: JSON.stringify(reserved),
      valueEst: rng.int(180000, 12000000),
      closesAt,
      description:
        "Open package on the Affordable Housing Programme. Matched on county, category, reserved-procurement status and reliability.",
    });
  }
  await prisma.opportunity.createMany({ data: opportunities });

  const prices: Prisma.MaterialPriceCreateManyInput[] = [];
  for (const item of ITEM_CATALOGUE) {
    for (const county of SEEDED_COUNTY_CODES) {
      for (let w = 0; w < 20; w += 1) {
        const weekOf = addDays(NOW, -19 * 7 + w * 7);
        weekOf.setUTCHours(0, 0, 0, 0);
        const drift = 1 + (rng.float() - 0.5) * 0.12 + (w / 20) * 0.04;
        prices.push({
          id: `px-${item.code}-${county}-${w}`,
          itemCode: item.code,
          itemName: item.itemName,
          unit: item.unit,
          countyCode: county,
          weekOf,
          medianRate: Math.round(item.typicalRate * drift),
          sampleSize: rng.int(8, 48),
        });
      }
    }
  }
  for (let i = 0; i < prices.length; i += 200) {
    await prisma.materialPrice.createMany({ data: prices.slice(i, i + 200) });
  }

  const counts = {
    nodes: await prisma.node.count(),
    entities: await prisma.entity.count(),
    users: await prisma.user.count(),
    contracts: await prisma.contract.count(),
    lines: await prisma.contractLine.count(),
    claims: await prisma.claim.count(),
    evidence: await prisma.evidence.count(),
    checks: await prisma.edgeCheck.count(),
    reviews: await prisma.review.count(),
    values: await prisma.valueOutcome.count(),
    settlements: await prisma.settlement.count(),
    certs: await prisma.certification.count(),
    opportunities: await prisma.opportunity.count(),
    finance: await prisma.financeProduct.count(),
    prices: await prisma.materialPrice.count(),
  };
  console.log("Seed complete", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
