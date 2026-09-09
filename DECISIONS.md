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
