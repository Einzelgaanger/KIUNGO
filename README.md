# Kiungo

Demonstration MVP of a sector operating platform for Kenya's housing and construction industry. Vertical one is the Affordable Housing Programme.

This is not a production system. Payments, WhatsApp Business API and government data are simulated.

## Setup

```bash
npx pnpm@9.15.9 install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Live demo: [https://kiungo.onrender.com](https://kiungo.onrender.com).

`npm install` hung on the original Windows host; `pnpm` is the reliable installer. `npm run build` still works.

## Reset the demo

```bash
npx prisma migrate reset
```

That reapplies the migration and runs the deterministic seed (`SEED = 20260909`).

## Demo path (nine minutes)

1. `/` — pitch and the six-step loop.
2. `/registry` — Nairobi, fabricators, youth-owned.
3. `/registry/kariobangi-metal-works` — certification and reliability.
4. `/whatsapp` — Play demo. A real claim is written.
5. Switch to Daniel Kiptoo → `/review` — approve with `A`.
6. Switch to Amina → the claim detail receipt.
7. `/finance` — available products and the gap on the rest.
8. `/intelligence` — programme dashboard and Needs attention.
9. `/api/public/entities` — machine-readable registry.

Closing line: housing is vertical one; the layer underneath is sector-agnostic.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js 15 with Turbopack |
| `npm run build` | Production build (required at the end of every phase) |
| `npm test` | Pure-function tests for geo, verification, value engine, scoring |
| `npx prisma studio` | Inspect SQLite at `prisma/dev.db` |
| `npx prisma db seed` | Reseed |

## Render

- **Build:** `npx pnpm@9.15.9 install && npm run build`
- **Start:** `npm start` (forces SQLite and seeds if the file is missing)
- **Env:** `DATABASE_URL=file:./dev.db` and `NEXT_PUBLIC_SITE_URL=https://kiungo.onrender.com`

## Personas

Use the role switcher in the sidebar (or More on mobile).

| Name | Role | Why |
|---|---|---|
| Amina Wanjiru | Supplier | Hero fabricator |
| Peter Otieno | Supplier | Pending verification |
| Grace Njeri | Contractor | Buyer on Mukuru |
| Daniel Kiptoo | Reviewer | Queue owner |
| Faith Muthoni | Programme | National dashboard |
| Samuel Barasa | Financier | Counterparty book |

## Notes

Assumptions live in `DECISIONS.md`. Copy is from the specification and should not be rewritten.
