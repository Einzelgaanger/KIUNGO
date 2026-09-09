export type Role =
  | "SUPPLIER"
  | "CONTRACTOR"
  | "REVIEWER"
  | "PROGRAMME"
  | "FINANCIER"
  | "CITIZEN"
  | "ADMIN";

export type ClaimStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "EDGE_CHECKED"
  | "QUEUED"
  | "APPROVED"
  | "QUERIED"
  | "FLAGGED"
  | "REJECTED"
  | "SETTLED";

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "EXPIRED"
  | "SUSPENDED";

export type EntityCategory =
  | "CONTRACTOR"
  | "DEVELOPER"
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "FABRICATOR"
  | "PROFESSIONAL"
  | "TRADE"
  | "FINANCIER"
  | "INSURER"
  | "PUBLIC_BODY"
  | "LOGISTICS";

export type SizeBand = "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

export type OwnershipTag = "YOUTH" | "WOMEN" | "PWD" | "JUA_KALI";

export type Channel = "WHATSAPP" | "WEB" | "USSD";

export type OppKind = "TENDER" | "SUBCONTRACT" | "COMPONENT_ORDER" | "CITIZEN_REQUEST";

export type FinanceKind =
  | "INVOICE_DISCOUNT"
  | "ASSET_FINANCE"
  | "STOCK_CREDIT"
  | "MORTGAGE"
  | "INSURANCE";

export type Session = {
  userId: string;
  name: string;
  role: Role;
  entityId: string | null;
  entityName: string | null;
  countyCode: string;
  phone: string;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type ScoreBreakdown = {
  onTime: number;
  evidenceQuality: number;
  queryRate: number;
  volumeConsistency: number;
  completedDeliveries: number;
  siteCount: number;
  since: Date | null;
};

export type County = {
  code: string;
  name: string;
  lat: number;
  lng: number;
};

export type DemoPersona = {
  id: string;
  name: string;
  role: Role;
  entityId: string | null;
  entityName: string | null;
  countyCode: string;
  phone: string;
  why: string;
};
