import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { haversineMeters, nearestSite, offsetLatLng } from "./geo";

describe("haversineMeters", () => {
  it("returns 0 for the same point", () => {
    const p = { lat: -1.3092, lng: 36.8721 };
    assert.equal(haversineMeters(p, p), 0);
  });

  it("measures Mukuru centre to a nearby pin in tens of metres", () => {
    const site = { lat: -1.3092, lng: 36.8721 };
    const pin = offsetLatLng(site, 60, 60);
    const d = haversineMeters(site, pin);
    assert.ok(d > 70 && d < 100);
  });
});

describe("nearestSite", () => {
  const sites = [
    {
      id: "mukuru",
      slug: "mukuru-phase-2",
      name: "Mukuru Phase 2, Embakasi South",
      lat: -1.3092,
      lng: 36.8721,
      geofenceM: 500,
      nodeId: "n1",
    },
    {
      id: "nakuru",
      slug: "nakuru-bondeni",
      name: "Bondeni Estate Regeneration",
      lat: -0.3031,
      lng: 36.08,
      geofenceM: 500,
      nodeId: "n2",
    },
  ];

  it("resolves a pin 84 m from Mukuru", () => {
    const pin = offsetLatLng({ lat: -1.3092, lng: 36.8721 }, 84, 0);
    const resolved = nearestSite(pin, sites);
    assert.ok(resolved);
    assert.equal(resolved?.site.slug, "mukuru-phase-2");
    assert.ok((resolved?.driftMeters ?? 0) < 100);
    assert.equal(resolved?.insideGeofence, true);
  });

  it("returns null when farther than 5 km from every site", () => {
    const resolved = nearestSite({ lat: 0.5, lng: 38.0 }, sites);
    assert.equal(resolved, null);
  });
});
