# Decisions and assumptions

Logged as the build proceeds. The specification is the source of truth; this file records only genuine gaps.

## Phase 1

- The Next.js app lives at the workspace root (`Kiungo`) rather than a nested `kiungo/` folder, because the workspace was already named for the product. The npm package name is `kiungo` (lowercase) to satisfy npm naming rules.
- shadcn primitives were authored against the token system instead of being generated and then restyled. The same Radix primitives and public APIs as `npx shadcn@latest add …` are used.
- Toasts use `sonner` (current shadcn default for the App Router) restyled to the tokens. The spec lists `toast`; the user-facing API is `toast()` from `sonner`.
- Zod 3 is used rather than Zod 4 so `@hookform/resolvers` stays on a stable path.
- Route protection reads `x-pathname` set by `src/middleware.ts`. Next.js layouts do not receive the URL otherwise.
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
