import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  { t: "Submit", d: "A supplier submits quantity, a photo and a GPS pin — WhatsApp or web." },
  { t: "Verify", d: "Edge checks test EXIF, timestamp, duplicate hash and contract balance." },
  { t: "Route", d: "Geo-resolution routes the claim to the reviewer for that site." },
  { t: "Review", d: "The reviewer approves, queries or rejects. Batch approve is blocked on hard fails." },
  { t: "Compute", d: "The value engine applies a quality multiplier and splits 80 / 10 / 10." },
  { t: "Settle", d: "A settlement instruction is recorded. Reliability is recomputed from history." },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteNav />
      <section className="bg-[#F3FAF5] py-16 md:py-24">
        <div className="container">
          <p className="label dark">How it works</p>
          <h1 className="mt-3 font-display text-[clamp(32px,5vw,64px)] font-bold tracking-[-0.03em] text-[#0E1F1A]">
            From delivery to settlement
          </h1>
          <p className="mt-4 max-w-xl text-[#5A6B60]">
            Six steps. One loop. Evidence in, settlement out.
          </p>
        </div>
      </section>

      <section className="mk-flow">
        <div className="container relative z-[1]">
          <div className="mk-rail">
            {STEPS.map((step, i) => (
              <Reveal key={step.t} delay={(Math.min(i, 4) || undefined) as 1 | 2 | 3 | 4 | undefined}>
                <div className="mk-step">
                  <div className="mk-step__disc">{i + 1}</div>
                  <h3>{step.t}</h3>
                  <p>{step.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="scroll-margin-nav bg-white py-16" id="api">
        <div className="container max-w-3xl">
          <p className="label dark">Public API</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[#0E1F1A]">Machine-readable registry</h2>
          <p className="mt-3 text-sm text-[#5A6B60]">
            Contact details, contract values and claim values are private. Everything else is machine-readable.
          </p>
          <ul className="mt-6 space-y-3 font-mono text-sm font-semibold">
            <li>
              <Link href="/api/public/entities" className="text-[#2E6B44] underline">
                GET /api/public/entities
              </Link>
            </li>
            <li>
              <Link href="/api/public/entities/kariobangi-metal-works" className="text-[#2E6B44] underline">
                GET /api/public/entities/kariobangi-metal-works
              </Link>
            </li>
            <li>
              <Link href="/api/public/stats" className="text-[#2E6B44] underline">
                GET /api/public/stats
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-[11px] text-[#5A6B7D]">Cache-Control: public, s-maxage=300. CORS is open on these routes.</p>
          <Link href="/registry" className="btn btn-dark mt-8">
            Open the registry
            <span className="node">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
