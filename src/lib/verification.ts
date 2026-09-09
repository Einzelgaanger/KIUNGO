import {
  EXIF_GPS_TOLERANCE_M,
  PHOTO_MAX_AGE_HOURS,
} from "@/lib/constants";
import { haversineMeters, type LatLng } from "@/lib/geo";

export type EdgeCheckKey =
  | "exif_gps_match"
  | "timestamp_plausible"
  | "duplicate_hash"
  | "quantity_within_balance";

export type EdgeCheckResult = {
  check: EdgeCheckKey;
  passed: boolean;
  detail: string;
  hard: boolean;
  soft: boolean;
};

export type EvidenceInput = {
  sha256: string;
  exifLat?: number | null;
  exifLng?: number | null;
  capturedAt?: Date | null;
};

export type VerificationInput = {
  submitted: LatLng;
  evidence: EvidenceInput[];
  quantity: number;
  remainingBalance: number;
  submittedAt: Date;
  existingHashes: Set<string>;
};

const HARD_FAILS: Record<EdgeCheckKey, boolean> = {
  exif_gps_match: false,
  timestamp_plausible: true,
  duplicate_hash: true,
  quantity_within_balance: true,
};

export function checkExifGpsMatch(
  evidence: EvidenceInput[],
  submitted: LatLng,
): EdgeCheckResult {
  const withGps = evidence.find(
    (item) => item.exifLat != null && item.exifLng != null,
  );
  if (!withGps || withGps.exifLat == null || withGps.exifLng == null) {
    return {
      check: "exif_gps_match",
      passed: true,
      detail: "No EXIF location; device location used",
      hard: false,
      soft: true,
    };
  }
  const delta = Math.round(
    haversineMeters(submitted, { lat: withGps.exifLat, lng: withGps.exifLng }),
  );
  const passed = delta <= EXIF_GPS_TOLERANCE_M;
  return {
    check: "exif_gps_match",
    passed,
    detail: passed
      ? `Photo GPS is ${delta} m from device GPS. Tolerance is ${EXIF_GPS_TOLERANCE_M} m.`
      : `Photo GPS is ${delta} m from device GPS. Tolerance is ${EXIF_GPS_TOLERANCE_M} m.`,
    hard: false,
    soft: !passed,
  };
}

export function checkTimestampPlausible(
  evidence: EvidenceInput[],
  submittedAt: Date,
): EdgeCheckResult {
  const captured = evidence.find((item) => item.capturedAt)?.capturedAt ?? null;
  if (!captured) {
    return {
      check: "timestamp_plausible",
      passed: false,
      detail: "Photo has no capture timestamp.",
      hard: true,
      soft: false,
    };
  }
  const deltaMs = submittedAt.getTime() - captured.getTime();
  const hours = deltaMs / (1000 * 60 * 60);
  if (hours < 0) {
    return {
      check: "timestamp_plausible",
      passed: false,
      detail: "Photo timestamp is in the future of the submission.",
      hard: true,
      soft: false,
    };
  }
  const passed = hours <= PHOTO_MAX_AGE_HOURS;
  const rounded = Math.max(0, Math.round(hours * 10) / 10);
  return {
    check: "timestamp_plausible",
    passed,
    detail: passed
      ? `Photo timestamp valid. Captured ${rounded} hours before submission.`
      : `This photograph was taken ${rounded} hours ago. Evidence must be captured within six hours of submission.`,
    hard: true,
    soft: false,
  };
}

export function checkDuplicateHash(
  evidence: EvidenceInput[],
  existingHashes: Set<string>,
): EdgeCheckResult {
  const duplicate = evidence.find((item) => existingHashes.has(item.sha256));
  if (duplicate) {
    return {
      check: "duplicate_hash",
      passed: false,
      detail: `This photograph has been submitted before. Hash ${duplicate.sha256.slice(0, 8)}…`,
      hard: true,
      soft: false,
    };
  }
  return {
    check: "duplicate_hash",
    passed: true,
    detail: `sha256:${evidence[0]?.sha256.slice(0, 8) ?? "none"}… unseen`,
    hard: true,
    soft: false,
  };
}

export function checkQuantityWithinBalance(
  quantity: number,
  remainingBalance: number,
): EdgeCheckResult {
  const passed = quantity > 0 && quantity <= remainingBalance;
  const over = Math.max(0, Math.round((quantity - remainingBalance) * 10) / 10);
  return {
    check: "quantity_within_balance",
    passed,
    detail: passed
      ? `${quantity} ≤ ${remainingBalance}`
      : `That is ${over} more than the contract balance of ${remainingBalance}. Reduce the quantity or raise a variation with the buyer.`,
    hard: true,
    soft: false,
  };
}

export function runEdgeChecks(input: VerificationInput): EdgeCheckResult[] {
  return [
    checkExifGpsMatch(input.evidence, input.submitted),
    checkTimestampPlausible(input.evidence, input.submittedAt),
    checkDuplicateHash(input.evidence, input.existingHashes),
    checkQuantityWithinBalance(input.quantity, input.remainingBalance),
  ];
}

export function hasHardFail(results: EdgeCheckResult[]): boolean {
  return results.some((result) => result.hard && !result.passed);
}

export function hasSoftFlag(results: EdgeCheckResult[]): boolean {
  return results.some((result) => result.soft);
}

export function isHardCheck(check: EdgeCheckKey): boolean {
  return HARD_FAILS[check];
}
