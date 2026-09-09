import { SITE_RESOLVE_MAX_M } from "@/lib/constants";

export type LatLng = { lat: number; lng: number };

export type SiteCandidate = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  geofenceM: number;
  nodeId: string;
};

export type SiteResolution = {
  site: SiteCandidate;
  driftMeters: number;
  insideGeofence: boolean;
};

export function haversineMeters(a: LatLng, b: LatLng): number {
  const earthM = 6_371_000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestSite(
  point: LatLng,
  sites: SiteCandidate[],
  maxMeters = SITE_RESOLVE_MAX_M,
): SiteResolution | null {
  let best: SiteResolution | null = null;
  for (const site of sites) {
    const driftMeters = Math.round(
      haversineMeters(point, { lat: site.lat, lng: site.lng }),
    );
    if (driftMeters > maxMeters) continue;
    if (!best || driftMeters < best.driftMeters) {
      best = {
        site,
        driftMeters,
        insideGeofence: driftMeters <= site.geofenceM,
      };
    }
  }
  return best;
}

export function offsetLatLng(
  origin: LatLng,
  eastMeters: number,
  northMeters: number,
): LatLng {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((origin.lat * Math.PI) / 180);
  return {
    lat: origin.lat + northMeters / metersPerDegLat,
    lng: origin.lng + eastMeters / Math.max(metersPerDegLng, 1),
  };
}
