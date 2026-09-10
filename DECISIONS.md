# Decisions and assumptions

Logged as the build proceeds. The specification is the source of truth; this file records only genuine gaps.

## IOUX visual port (Sep 2026)

- Kiungo keeps its product copy, IA and housing domain. The IOUX transfer guide supplies chrome only: forest/lime/gold, Plus Jakarta + Space Grotesk + Inter + IBM Plex Mono, portal density, marketing hero shade stack.
- Mark is a forest tile + interlocking link + lime node (`BrandMark`). It is not the IOUX U path.
- Photography is construction / housing / workshop (Unsplash), not clinical or warehouse-logistics leftovers from IOUX.
- Portal CSS lives in `src/app/portal.css`; marketing in `src/app/marketing.css` under `.kiungo-site`.
- `SectionHeading` `as="h1"` now renders the forest `PageHeader` + 4×16 lime tick.

## Phase 1

- The Next.js app lives at the workspace root (`Kiungo`) rather than a nested `kiungo/` folder, because the workspace was already named for the product. The npm package name is `kiungo` (lowercase) to satisfy npm naming rules.
- shadcn primitives were authored against the token system instead of being generated and then restyled. The same Radix primitives and public APIs as `npx shadcn@latest add …` are used.
- Toasts use `sonner` (current shadcn default for the App Router) restyled to the tokens. The spec lists `toast`; the user-facing API is `toast()` from `sonner`.
- Zod 3 is used rather than Zod 4 so `@hookform/resolvers` stays on a stable path.
- Route protection is a client `AuthGate` using `usePathname()`. A middleware `x-pathname` header was removed so the portal layout is not invalidated on every tab click.
- Role-switcher personas use stable ids (`user-amina`, …) that Phase 2 seed must reuse.
- Swahili is a production requirement. The MVP is English-only as specified.
- `.env` is gitignored by the Next.js template. `.env.example` documents `DATABASE_URL="file:./dev.db"`.
- Dependencies are installed with `pnpm` (via `npx pnpm`) because `npm install` hung repeatedly on this Windows host after resolving packages. `npm run build` still works. Lockfile is `pnpm-lock.yaml`.

## Phase 2

- Section 8.4 category counts sum to 194, not 180. Counts were scaled to exactly 180 entities while keeping the same rank order (fabricators still the largest group).
- Approved + settled under the 8.6 split is 576 value outcomes, not ~610. Settlements equal the 468 SETTLED claims. Extra historical QUERY reviews on ~47 settled claims bring the review count toward ~740.
- Daniel Kiptoo sits on the NATIONAL node so `resolveSiteAndReviewer` always finds him when walking up from any site. County reviewers exist but are not the first hit for the pilot sites.
- Delivery JPEGs in `public/mock` are valid solid-colour files with a unique COM comment. They are not photographs of sites.
- Section 11.3 quotes a 1.05 multiplier for 40 × KSh 4,850. Section 13.2 adds +0.03 for 84 m drift and +0.02 for a same-day review, so the engine yields 1.10 / KSh 213,400. The live UI will show the computed receipt.
- Reliability is computed from claim history after seed. Amina's score is whatever that function returns; it is not forced to 78.

## Phase 3

- `<MapPanel>` was built in Phase 3 because the entity profile (10.3) requires a site map. Phase 4 will reuse it on claim and site pages.
- Ownership filtering happens in memory after the SQL page fetch because tags are stored as a JSON string in SQLite. Filtered totals can therefore differ from unfiltered pagination when ownership is set.

## Phase 5

- The WhatsApp approval bubble after three seconds is theatrical copy from §11.3. It does **not** call `decideClaim`, so the live claim remains `QUEUED` for Daniel's review queue — that is the demo beat.
- Live value after a real approval follows §13.2 (typically 1.10 / KSh 213,400 for the 40-unit door-frame example), not the chat script's 1.05 / KSh 203,700.

## Phase 6

- Intelligence date/site/county filters are URL search params and recompute server-side.
- Materials item selection is fixed to four catalogue lines (cement, D12, door frame, aluminium window) so the demo is stable.
- Financier sparklines are 12-week claim counts, 60×20, no axes.

## Phase 7

- Citizen estimate bands use m²-per-bedroom × finish rate so a 3-bed standard Nairobi house lands in KSh 3.4m–4.6m.
- Open Graph images for entity profiles live at `(app)/registry/[slug]/opengraph-image.tsx` so they share the `/registry/[slug]` route. `ImageResponse` cannot resolve CSS variables, so forest/lime hex values are inlined there only. The same exception applies to `src/app/icon.tsx` and `src/app/apple-icon.tsx`.
- The Next.js Dev Tools "N" is hidden with `devIndicators: false`. It is a development overlay, not a product control.
- Next 15 defaults the dynamic client router cache to 0s. `experimental.staleTimes.dynamic` is 300s so sidebar tab switches reuse the last RSC payload. Mutations already call `revalidatePath` / `router.refresh()`.

## Phase 8

- Unseeded databases are handled with `withDb()` so Prisma connection/schema errors render empty or fallback UI instead of crashing.
- Review-queue age dots use `DEMO_NOW_ISO` (9 Sep 2026), not the machine clock.
- Swahili remains a production requirement; the MVP is English-only as specified.
- Four-state handling on server pages uses App Router `loading.tsx` (skeleton) and `error.tsx` (retry), plus designed empty states when a query returns no rows.
- Edge-check pass/fail uses `<CheckChip>`, not `<StatusBadge>`, because those are check results rather than claim or verification statuses.
- Live demo origin is `https://kiungo.jabali.studio` (`NEXT_PUBLIC_SITE_URL`). Render injects a non-SQLite `DATABASE_URL` at runtime, which emptied every page. Prisma is pinned to `file:./dev.db`, `src/lib/db.ts` overrides the client URL, `npm start` uses `scripts/start.mjs`, and the seeded `prisma/dev.db` is committed so the slug has data.
- Site social card is `src/app/opengraph-image.tsx` (1200×630). WhatsApp reads `og:title`, `og:description` and that PNG; `metadataBase` is the live origin so the image URL is absolute.
