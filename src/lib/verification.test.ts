import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runEdgeChecks } from "./verification";

const submittedAt = new Date("2026-09-09T10:00:00.000Z");

describe("runEdgeChecks", () => {
  it("passes the four checks for a clean submission", () => {
    const results = runEdgeChecks({
      submitted: { lat: -1.3089, lng: 36.8726 },
      evidence: [
        {
          sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          exifLat: -1.309,
          exifLng: 36.8725,
          capturedAt: new Date("2026-09-09T09:56:00.000Z"),
        },
      ],
      quantity: 40,
      remainingBalance: 180,
      submittedAt,
      existingHashes: new Set(),
    });
    assert.equal(results.length, 4);
    assert.ok(results.every((r) => r.passed));
  });

  it("soft-flags missing EXIF GPS and still passes that check", () => {
    const results = runEdgeChecks({
      submitted: { lat: -1.3089, lng: 36.8726 },
      evidence: [
        {
          sha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          capturedAt: new Date("2026-09-09T09:50:00.000Z"),
        },
      ],
      quantity: 10,
      remainingBalance: 180,
      submittedAt,
      existingHashes: new Set(),
    });
    const exif = results.find((r) => r.check === "exif_gps_match");
    assert.equal(exif?.passed, true);
    assert.equal(exif?.soft, true);
  });

  it("hard-fails a stale photo and an over-balance quantity", () => {
    const results = runEdgeChecks({
      submitted: { lat: -1.3089, lng: 36.8726 },
      evidence: [
        {
          sha256: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          capturedAt: new Date("2026-09-08T20:00:00.000Z"),
        },
      ],
      quantity: 200,
      remainingBalance: 180,
      submittedAt,
      existingHashes: new Set(),
    });
    assert.equal(results.find((r) => r.check === "timestamp_plausible")?.passed, false);
    assert.equal(results.find((r) => r.check === "quantity_within_balance")?.passed, false);
  });

  it("hard-fails a duplicate hash", () => {
    const hash = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    const results = runEdgeChecks({
      submitted: { lat: -1.3089, lng: 36.8726 },
      evidence: [{ sha256: hash, capturedAt: new Date("2026-09-09T09:50:00.000Z") }],
      quantity: 10,
      remainingBalance: 180,
      submittedAt,
      existingHashes: new Set([hash]),
    });
    assert.equal(results.find((r) => r.check === "duplicate_hash")?.passed, false);
  });
});
