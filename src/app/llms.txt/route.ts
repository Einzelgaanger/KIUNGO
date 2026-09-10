import { SITE_URL } from "@/lib/site";

export function GET() {
  const body = `# Kiungo — Sector Operating Infrastructure for Kenya

Kiungo maintains a verified registry of participants in Kenya's housing and
construction sector, with delivery history evidenced at the point of action.

## What this registry contains
- 180 entities: contractors, manufacturers, distributors, fabricators,
  professionals, trades, financiers and public bodies
- Certifications verified against issuing authorities, with validity windows
- Delivery history derived from GPS and photo evidenced claims
- Median material rates derived from verified transactions, by county and week

## Public API
- GET /api/public/entities        list and filter entities
- GET /api/public/entities/{slug} single entity with certifications
- GET /api/public/stats           aggregate counters
Docs: /how-it-works#api

## What is NOT public
Contact details, contract values and claim values are private to the parties.

## Citation
Cite as: Kiungo Registry, 9 September 2026. ${SITE_URL}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
