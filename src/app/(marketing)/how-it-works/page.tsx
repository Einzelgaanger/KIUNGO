import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <div className="bg-paper text-ink-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 md:px-8">
        <div className="h-[3px] w-9 rounded-full bg-lime-500" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">How it works</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">From delivery to settlement</h1>
        <ol className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-600">
          <li>1. A supplier submits quantity, a photo and a GPS pin — WhatsApp or web.</li>
          <li>2. Edge checks test EXIF, timestamp, duplicate hash and contract balance.</li>
          <li>3. Geo-resolution routes the claim to the reviewer for that site.</li>
          <li>4. The reviewer approves, queries or rejects. Batch approve is blocked on hard fails.</li>
          <li>5. The value engine applies a quality multiplier and splits 80 / 10 / 10.</li>
          <li>6. A settlement instruction is recorded. Reliability is recomputed from history.</li>
        </ol>

        <h2 id="api" className="mt-12 font-display text-xl font-semibold">
          Public API
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          Contact details, contract values and claim values are private. Everything else is machine-readable.
        </p>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          <li>
            <Link href="/api/public/entities" className="underline">
              GET /api/public/entities
            </Link>{" "}
            q, category, county, verification, ownership, minReliability, page, limit
          </li>
          <li>
            <Link href="/api/public/entities/kariobangi-metal-works" className="underline">
              GET /api/public/entities/kariobangi-metal-works
            </Link>
          </li>
          <li>
            <Link href="/api/public/stats" className="underline">
              GET /api/public/stats
            </Link>
          </li>
        </ul>
        <p className="mt-6 text-xs text-ink-400">Cache-Control: public, s-maxage=300. CORS is open on these routes.</p>
      </div>
    </div>
  );
}
