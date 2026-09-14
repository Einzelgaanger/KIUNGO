import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Reveal } from "@/components/marketing/Reveal";
import { getEntityBySlug } from "@/lib/entities";
import { toPublicEntity } from "@/lib/public-api";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  { t: "Submit", d: "A supplier submits quantity, a photo and a GPS pin — WhatsApp or web." },
  { t: "Verify", d: "Edge checks test EXIF, timestamp, duplicate hash and contract balance." },
  { t: "Route", d: "Geo-resolution routes the claim to the reviewer for that site." },
  { t: "Review", d: "The reviewer approves, queries or rejects. Batch approve is blocked on hard fails." },
  { t: "Compute", d: "The value engine applies a quality multiplier and splits 80 / 10 / 10." },
  { t: "Settle", d: "A settlement instruction is recorded. Reliability is recomputed from history." },
];

export default async function HowItWorksPage() {
  let preview: string | null = null;
  try {
    const entity = await getEntityBySlug("kariobangi-metal-works");
    if (entity) {
      const capability = Array.from(new Set(entity.claims.map((claim) => claim.contractLine.itemName)));
      preview = JSON.stringify(toPublicEntity(entity, capability), null, 2);
    }
  } catch {
    preview = null;
  }

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
          <p className="label dark">For integrators</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[#0E1F1A]">The same registry, without phones or values</h2>
          <p className="mt-3 text-sm text-[#5A6B60]">
            A ministry or bank can call the registry from their own systems. Contact details, contract values and claim
            values stay private. Reviewers stay in the product — this is the record, not a download.
          </p>
          <ul className="mt-6 space-y-2 font-mono text-sm font-semibold text-[#0E1F1A]">
            <li>GET /api/public/entities</li>
            <li>GET /api/public/entities/kariobangi-metal-works</li>
            <li>GET /api/public/stats</li>
          </ul>
          {preview ? (
            <pre className="mt-6 max-h-80 overflow-auto rounded-2xl border border-[#E3E7E0] bg-[#F3FAF5] p-4 text-[12px] leading-relaxed text-[#0E1F1A]">
              {preview}
            </pre>
          ) : null}
          <p className="mt-4 text-[11px] text-[#5A6B7D]">Cached for five minutes. CORS is open on these routes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/walkthrough" className="btn btn-dark">
              Live walkthroughs
              <span className="node">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link href="/registry/kariobangi-metal-works" className="btn btn-ghost-dark border-[#0E1F1A]/20 text-[#0E1F1A]">
              Open this file in the registry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
