import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeReliability, type ScoreClaim } from "./scoring";

function claim(partial: Partial<ScoreClaim> & { submittedAt: Date }): ScoreClaim {
  return {
    status: "SETTLED",
    queried: false,
    rejected: false,
    allChecksPassedFirstTime: true,
    completed: true,
    ...partial,
  };
}

describe("computeReliability", () => {
  it("returns null with fewer than three completed deliveries", () => {
    const result = computeReliability(
      [
        claim({ submittedAt: new Date("2026-09-01") }),
        claim({ submittedAt: new Date("2026-09-02") }),
      ],
      1,
      new Date("2026-09-01"),
    );
    assert.equal(result.score, null);
    assert.equal(result.breakdown.completedDeliveries, 2);
  });

  it("scores a clean history in the lime band", () => {
    const claims: ScoreClaim[] = [];
    for (let i = 0; i < 20; i += 1) {
      claims.push(
        claim({
          submittedAt: new Date(Date.UTC(2026, 7, 1 + i)),
        }),
      );
    }
    const result = computeReliability(claims, 2, new Date("2026-08-01"));
    assert.ok(result.score != null && result.score >= 70);
    assert.equal(result.breakdown.completedDeliveries, 20);
  });

  it("never invents a score without the delivery count", () => {
    const result = computeReliability(
      Array.from({ length: 5 }, (_, i) =>
        claim({ submittedAt: new Date(Date.UTC(2026, 8, i + 1)) }),
      ),
      1,
      new Date("2026-09-01"),
    );
    assert.ok(result.breakdown.completedDeliveries >= 3);
    assert.ok(result.score != null);
  });
});
