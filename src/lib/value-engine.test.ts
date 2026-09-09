import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EdgeCheckResult } from "./verification";
import { computeValueOutcome } from "./value-engine";

const passed: EdgeCheckResult[] = [
  { check: "exif_gps_match", passed: true, detail: "ok", hard: false, soft: false },
  { check: "timestamp_plausible", passed: true, detail: "ok", hard: true, soft: false },
  { check: "duplicate_hash", passed: true, detail: "ok", hard: true, soft: false },
  { check: "quantity_within_balance", passed: true, detail: "ok", hard: true, soft: false },
];

describe("computeValueOutcome", () => {
  it("reproduces 40 frames at 4850 with the Section 13.2 adjustments", () => {
    const decidedAt = new Date("2026-09-09T10:05:00.000Z");
    const first = computeValueOutcome({
      claimRef: "CLM-2026-004821",
      quantity: 40,
      unitRate: 4850,
      edgeChecks: passed,
      driftMeters: 84,
      approvedWithinHours: 0.1,
      entityReliability: 78,
      previouslyQueried: false,
      evidenceHashes: ["aaa"],
      reviewerId: "user-daniel",
      decidedAt,
    });
    assert.equal(first.baseAmount, 194000);
    // +0.05 all checks, +0.03 drift ≤100, +0.02 reviewed <24h; reliability 78 misses +0.05
    assert.equal(first.qualityMultiplier, 1.1);
    assert.equal(first.grossAmount, 213400);
    assert.equal(first.supplierShare + first.platformShare + first.welfareShare, first.grossAmount);
    assert.equal(first.supplierShare, 170720);
    assert.equal(first.platformShare, 21340);

    const second = computeValueOutcome({
      claimRef: "CLM-2026-004821",
      quantity: 40,
      unitRate: 4850,
      edgeChecks: passed,
      driftMeters: 84,
      approvedWithinHours: 0.1,
      entityReliability: 78,
      previouslyQueried: false,
      evidenceHashes: ["aaa"],
      reviewerId: "user-daniel",
      decidedAt,
    });
    assert.equal(second.proofSetHash, first.proofSetHash);
  });

  it("clamps the multiplier and absorbs rounding in the welfare share", () => {
    const result = computeValueOutcome({
      claimRef: "CLM-2026-000001",
      quantity: 1,
      unitRate: 100,
      edgeChecks: passed,
      driftMeters: 10,
      approvedWithinHours: 1,
      entityReliability: 90,
      previouslyQueried: true,
      evidenceHashes: ["z", "a"],
      reviewerId: "user-daniel",
      decidedAt: new Date("2026-09-01T00:00:00.000Z"),
    });
    assert.ok(result.qualityMultiplier >= 0.85 && result.qualityMultiplier <= 1.15);
    assert.equal(
      result.supplierShare + result.platformShare + result.welfareShare,
      result.grossAmount,
    );
  });
});
