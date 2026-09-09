import type {
  ClaimStatus,
  County,
  DemoPersona,
  EntityCategory,
  OwnershipTag,
  Role,
  VerificationStatus,
} from "@/types";

export const SESSION_COOKIE = "kiungo_user";

export const COUNTIES: County[] = [
  { code: "001", name: "Mombasa", lat: -4.0435, lng: 39.6682 },
  { code: "002", name: "Kwale", lat: -4.1816, lng: 39.4521 },
  { code: "003", name: "Kilifi", lat: -3.5107, lng: 39.9093 },
  { code: "004", name: "Tana River", lat: -1.5286, lng: 39.6987 },
  { code: "005", name: "Lamu", lat: -2.2717, lng: 40.902 },
  { code: "006", name: "Taita-Taveta", lat: -3.3962, lng: 38.556 },
  { code: "007", name: "Garissa", lat: -0.4532, lng: 39.6461 },
  { code: "008", name: "Wajir", lat: 1.7471, lng: 40.0573 },
  { code: "009", name: "Mandera", lat: 3.9366, lng: 41.867 },
  { code: "010", name: "Marsabit", lat: 2.3346, lng: 37.99 },
  { code: "011", name: "Isiolo", lat: 0.3556, lng: 37.5822 },
  { code: "012", name: "Meru", lat: 0.0463, lng: 37.6559 },
  { code: "013", name: "Tharaka-Nithi", lat: -0.2967, lng: 37.7663 },
  { code: "014", name: "Embu", lat: -0.539, lng: 37.4575 },
  { code: "015", name: "Kitui", lat: -1.367, lng: 38.0106 },
  { code: "016", name: "Machakos", lat: -1.5177, lng: 37.2634 },
  { code: "017", name: "Makueni", lat: -1.804, lng: 37.624 },
  { code: "018", name: "Nyandarua", lat: -0.3667, lng: 36.3667 },
  { code: "019", name: "Nyeri", lat: -0.4197, lng: 36.9476 },
  { code: "020", name: "Kirinyaga", lat: -0.4989, lng: 37.2803 },
  { code: "021", name: "Murang'a", lat: -0.721, lng: 37.1526 },
  { code: "022", name: "Kiambu", lat: -1.1714, lng: 36.8356 },
  { code: "023", name: "Turkana", lat: 3.119, lng: 35.598 },
  { code: "024", name: "West Pokot", lat: 1.2389, lng: 35.111 },
  { code: "025", name: "Samburu", lat: 1.0968, lng: 36.698 },
  { code: "026", name: "Trans Nzoia", lat: 1.0187, lng: 35.0023 },
  { code: "027", name: "Uasin Gishu", lat: 0.5143, lng: 35.2698 },
  { code: "028", name: "Elgeyo-Marakwet", lat: 0.8, lng: 35.5333 },
  { code: "029", name: "Nandi", lat: 0.187, lng: 35.118 },
  { code: "030", name: "Baringo", lat: 0.4667, lng: 35.9833 },
  { code: "031", name: "Laikipia", lat: 0.0273, lng: 37.072 },
  { code: "032", name: "Nakuru", lat: -0.3031, lng: 36.08 },
  { code: "033", name: "Narok", lat: -1.0855, lng: 35.873 },
  { code: "034", name: "Kajiado", lat: -1.8525, lng: 36.782 },
  { code: "035", name: "Kericho", lat: -0.3677, lng: 35.286 },
  { code: "036", name: "Bomet", lat: -0.782, lng: 35.342 },
  { code: "037", name: "Kakamega", lat: 0.2827, lng: 34.7519 },
  { code: "038", name: "Vihiga", lat: 0.075, lng: 34.725 },
  { code: "039", name: "Bungoma", lat: 0.5635, lng: 34.5606 },
  { code: "040", name: "Busia", lat: 0.46, lng: 34.111 },
  { code: "041", name: "Siaya", lat: 0.0607, lng: 34.288 },
  { code: "042", name: "Kisumu", lat: -0.0917, lng: 34.768 },
  { code: "043", name: "Homa Bay", lat: -0.5273, lng: 34.4571 },
  { code: "044", name: "Migori", lat: -1.0634, lng: 34.4731 },
  { code: "045", name: "Kisii", lat: -0.6773, lng: 34.7796 },
  { code: "046", name: "Nyamira", lat: -0.5633, lng: 34.9358 },
  { code: "047", name: "Nairobi", lat: -1.2864, lng: 36.8172 },
];

export const SEEDED_COUNTY_CODES = [
  "047",
  "022",
  "016",
  "034",
  "032",
  "042",
  "001",
  "027",
] as const;

export const COUNTY_BY_CODE: Record<string, County> = Object.fromEntries(
  COUNTIES.map((county) => [county.code, county]),
);

export function countyName(code: string): string {
  return COUNTY_BY_CODE[code]?.name ?? code;
}

export const ENTITY_CATEGORY_LABELS: Record<EntityCategory, string> = {
  CONTRACTOR: "Contractor",
  DEVELOPER: "Developer",
  MANUFACTURER: "Manufacturer",
  DISTRIBUTOR: "Distributor",
  FABRICATOR: "Fabricator",
  PROFESSIONAL: "Professional",
  TRADE: "Trade",
  FINANCIER: "Financier",
  INSURER: "Insurer",
  PUBLIC_BODY: "Public body",
  LOGISTICS: "Logistics",
};

export const OWNERSHIP_TAG_LABELS: Record<OwnershipTag, string> = {
  YOUTH: "Youth",
  WOMEN: "Women",
  PWD: "PWD",
  JUA_KALI: "Jua Kali",
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPPLIER: "Supplier",
  CONTRACTOR: "Contractor",
  REVIEWER: "Reviewer",
  PROGRAMME: "Programme",
  FINANCIER: "Financier",
  CITIZEN: "Citizen",
  ADMIN: "Admin",
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  EDGE_CHECKED: "Edge checked",
  QUEUED: "Queued",
  APPROVED: "Approved",
  QUERIED: "Queried",
  FLAGGED: "Flagged",
  REJECTED: "Rejected",
  SETTLED: "Settled",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  UNVERIFIED: "Unverified",
  PENDING: "Pending",
  VERIFIED: "Verified",
  EXPIRED: "Expired",
  SUSPENDED: "Suspended",
};

export const ALL_ROLES: Role[] = [
  "SUPPLIER",
  "CONTRACTOR",
  "REVIEWER",
  "PROGRAMME",
  "FINANCIER",
  "CITIZEN",
  "ADMIN",
];

export const ROUTE_ROLES: Record<string, Role[] | "public"> = {
  "/registry": "public",
  "/console": ["SUPPLIER", "CONTRACTOR", "ADMIN"],
  "/review": ["REVIEWER", "PROGRAMME", "ADMIN"],
  "/opportunities": ["SUPPLIER", "CONTRACTOR", "PROGRAMME", "ADMIN"],
  "/finance": ["SUPPLIER", "CONTRACTOR", "FINANCIER", "ADMIN"],
  "/intelligence": ["PROGRAMME", "ADMIN", "FINANCIER"],
  "/build": "public",
  "/sites": "public",
};

export function rolesForPath(pathname: string): Role[] | "public" {
  const match = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!match) return "public";
  return ROUTE_ROLES[match] ?? "public";
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "user-amina",
    name: "Amina Wanjiru",
    role: "SUPPLIER",
    entityId: "ent-kariobangi-metal-works",
    entityName: "Kariobangi Metal Works Ltd",
    countyCode: "047",
    phone: "+254712000001",
    why: "The hero. Youth + women tagged, verified, reliability 78, active claims on Mukuru.",
  },
  {
    id: "user-peter",
    name: "Peter Otieno",
    role: "SUPPLIER",
    entityId: "ent-kondele-fabricators",
    entityName: "Kondele Fabricators Self-Help Group",
    countyCode: "042",
    phone: "+254712000002",
    why: "The contrast. PENDING verification, reliability null, blocked from a finance product.",
  },
  {
    id: "user-grace",
    name: "Grace Njeri",
    role: "CONTRACTOR",
    entityId: "ent-sample-builders-group",
    entityName: "Sample Builders Group Ltd",
    countyCode: "047",
    phone: "+254712000003",
    why: "Sees supplier deliveries into her site.",
  },
  {
    id: "user-daniel",
    name: "Daniel Kiptoo",
    role: "REVIEWER",
    entityId: "ent-ahb",
    entityName: "Affordable Housing Board",
    countyCode: "047",
    phone: "+254712000004",
    why: "Owns the Mukuru + Nakuru review queue.",
  },
  {
    id: "user-faith",
    name: "Faith Muthoni",
    role: "PROGRAMME",
    entityId: "ent-ahb",
    entityName: "Affordable Housing Board",
    countyCode: "047",
    phone: "+254712000005",
    why: "National dashboard, all sites.",
  },
  {
    id: "user-samuel",
    name: "Samuel Barasa",
    role: "FINANCIER",
    entityId: "ent-sample-bank-a",
    entityName: "Sample Bank A",
    countyCode: "047",
    phone: "+254712000006",
    why: "Sees verified counterparties and applications.",
  },
];

export const ITEM_CATALOGUE = [
  { code: "CEM-32.5", itemName: "Cement 32.5N, 50kg", unit: "bag", typicalRate: 780 },
  { code: "STL-D12", itemName: "Reinforcement bar D12", unit: "length", typicalRate: 1240 },
  { code: "STL-D8", itemName: "Reinforcement bar D8", unit: "length", typicalRate: 560 },
  { code: "BAL-20", itemName: "Ballast 20mm", unit: "tonne", typicalRate: 2400 },
  { code: "SND-RIV", itemName: "River sand", unit: "tonne", typicalRate: 2150 },
  { code: "DR-STL-900", itemName: "Steel door frame 900mm", unit: "unit", typicalRate: 4850 },
  { code: "DR-FLU-800", itemName: "Flush door shutter 800mm", unit: "unit", typicalRate: 5600 },
  { code: "WIN-AL-1212", itemName: "Aluminium window 1200×1200", unit: "unit", typicalRate: 9400 },
  { code: "RF-IT-30", itemName: "Roofing sheet IT5 30g", unit: "sheet", typicalRate: 1180 },
  { code: "TIL-CER-40", itemName: "Ceramic floor tile 400×400", unit: "m²", typicalRate: 1050 },
  { code: "PPE-PVC-32", itemName: "PVC pipe 32mm", unit: "length", typicalRate: 690 },
  { code: "ELC-CBL-25", itemName: "Electrical cable 2.5mm", unit: "roll", typicalRate: 4300 },
] as const;

export const FABRICATOR_ITEM_CODES = [
  "DR-STL-900",
  "DR-FLU-800",
  "WIN-AL-1212",
] as const;

export const BULK_ITEM_CODES = [
  "CEM-32.5",
  "STL-D12",
  "STL-D8",
  "BAL-20",
  "SND-RIV",
  "RF-IT-30",
  "TIL-CER-40",
  "PPE-PVC-32",
  "ELC-CBL-25",
] as const;

export const SITES = [
  {
    id: "site-mukuru-phase-2",
    slug: "mukuru-phase-2",
    name: "Mukuru Phase 2, Embakasi South",
    countyCode: "047",
    lat: -1.3092,
    lng: 36.8721,
    unitsPlanned: 4800,
    startedAt: "2025-03-10",
    targetAt: "2027-03-10",
    geofenceM: 500,
  },
  {
    id: "site-starehe-block-c",
    slug: "starehe-block-c",
    name: "Starehe Point Block C",
    countyCode: "047",
    lat: -1.276,
    lng: 36.834,
    unitsPlanned: 1240,
    startedAt: "2025-08-01",
    targetAt: "2027-02-01",
    geofenceM: 500,
  },
  {
    id: "site-kajiado-mashuuru",
    slug: "kajiado-mashuuru",
    name: "Mashuuru Affordable Homes",
    countyCode: "034",
    lat: -1.85,
    lng: 37.13,
    unitsPlanned: 620,
    startedAt: "2026-01-15",
    targetAt: "2027-07-15",
    geofenceM: 500,
  },
  {
    id: "site-nakuru-bondeni",
    slug: "nakuru-bondeni",
    name: "Bondeni Estate Regeneration",
    countyCode: "032",
    lat: -0.3031,
    lng: 36.08,
    unitsPlanned: 1860,
    startedAt: "2025-06-20",
    targetAt: "2027-06-20",
    geofenceM: 500,
  },
  {
    id: "site-kisumu-lumumba",
    slug: "kisumu-lumumba",
    name: "Lumumba Housing Estate",
    countyCode: "042",
    lat: -0.0917,
    lng: 34.768,
    unitsPlanned: 1700,
    startedAt: "2025-05-05",
    targetAt: "2027-05-05",
    geofenceM: 500,
  },
  {
    id: "site-machakos-stoni-athi",
    slug: "machakos-stoni-athi",
    name: "Stoni Athi Phase 1",
    countyCode: "016",
    lat: -1.446,
    lng: 37.018,
    unitsPlanned: 2820,
    startedAt: "2026-02-01",
    targetAt: "2027-08-01",
    geofenceM: 500,
  },
] as const;

export const COPY = {
  landing: {
    eyebrow: "SECTOR OPERATING INFRASTRUCTURE FOR KENYA",
    headline: "The industry exists. The system doesn't.",
    sub: "Kiungo is the operating layer for a sector. It holds the identity of every participant, the verified record of what they did and the settlement of what they are owed. Vertical one is housing and construction.",
    ctaRegistry: "See the live registry",
    ctaWhatsapp: "Open the WhatsApp demo",
    problemCitizen:
      "A citizen who wants to build. Ten to thirty counterparties, no reference price, no verified track record and no recourse. Kenya has a two million unit housing deficit and about 30,000 mortgage accounts.",
    problemEnterprise:
      "An enterprise that wants to supply. A fabricator can make the doors. What it cannot do is prove it to someone who does not already know it. Invisible is not the same as risky, but it is priced the same way.",
    problemState:
      "A state that cannot see. Over 271,000 units in development across 47 counties. Delivery reporting arrives in quarters, not days, and cannot be independently verified.",
    ctaBand:
      "A portal shows you who exists. Infrastructure lets you work, prove it and get paid.",
    footerNote: "Demonstration build. All entities, claims and values are synthetic.",
  },
  empty: {
    registryFiltered: {
      title: "No entities match those filters.",
      description:
        "Try widening the county or verification filters. There are {total} entities in the registry.",
    },
    claimsNone: {
      title: "No claims yet.",
      description:
        "Submit your first delivery and it will appear here with its evidence and status.",
    },
    reviewClear: {
      title: "Queue clear.",
      description:
        "All claims have been reviewed. Median decision time today was {time}.",
    },
    opportunitiesNone: {
      title: "Nothing matched your profile this week.",
      description:
        "Opportunities are matched on county, category, reserved-procurement status and reliability. Widen your filters to see everything open.",
    },
    financeNone: {
      title: "No products available yet.",
      description:
        "Complete three verified deliveries and financing options will appear here.",
    },
    searchNone: {
      title: 'Nothing found for "{query}".',
      description: "Check the spelling or search by county or item instead.",
    },
    unauthorised: {
      title: "This view is for a different role.",
      description:
        "Switch persona in the sidebar to open this page. The demonstration never dead-ends.",
    },
  },
  verification: {
    verified: "Verified · Certification confirmed with {authority}, valid to {date}.",
    pending:
      "Verification pending · Submitted to {authority}. Delivery history is shown but certification is unconfirmed.",
    expired: "Certification expired · Expired {date}. Renew with {authority} to restore verified status.",
    expiringSoon: "Expires in {n} days · Renew with {authority} to avoid losing verified status.",
  },
  score: {
    withHistory:
      "Reliability {score}. Based on {n} completed deliveries across {sites} sites since {date}.",
    without: "Insufficient history. A reliability score appears after three completed deliveries.",
  },
  claimErrors: {
    overBalance:
      "That is {n} {unit} more than the contract balance of {balance}. Reduce the quantity or raise a variation with the buyer.",
    offSite:
      "This location is {n} km from the nearest known site. Check your location pin before submitting.",
    duplicatePhoto:
      "This photograph has been submitted before, on claim {ref}. Take a new photograph of this delivery.",
    stalePhoto:
      "This photograph was taken {n} hours ago. Evidence must be captured within six hours of submission.",
  },
  consent:
    "Applying shares your verified profile with {provider}: your legal name, registration number, certifications, reliability score and a summary of your completed deliveries. It does not share your contract values, your contacts or your evidence photographs. You can withdraw this application at any time.",
  disclaimers: {
    buildEstimate:
      "Indicative only. Based on median rates from verified deliveries in {county} over the last 12 weeks. Not a quotation.",
    materialsIndex:
      "Prices are medians of rates on verified delivery claims, not survey estimates. Sample sizes are shown for every point.",
    entityValues: "Contract values are visible only to the parties involved.",
  },
} as const;

export const POLICY_VERSION = "housing.tariff.v1";
export const FLOW_VERSION = "housing.delivery.v1";
export const PAGE_SIZE = 24;
export const MIN_RELIABILITY_HISTORY = 3;
export const EXIF_GPS_TOLERANCE_M = 200;
export const PHOTO_MAX_AGE_HOURS = 6;
export const SITE_RESOLVE_MAX_M = 5000;
