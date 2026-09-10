import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/kiungo/PendingLink";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Reveal } from "@/components/marketing/Reveal";
import { BRAND, PHOTOS } from "@/lib/brand";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";

const LOOP = [
  { t: "Submit", d: "Quantity, photo and a GPS pin — WhatsApp or web." },
  { t: "Verify", d: "EXIF, timestamp, hash and contract balance." },
  { t: "Route", d: "Geo-resolution to the reviewer for that site." },
  { t: "Review", d: "Approve, query or reject. Hard fails block batch." },
  { t: "Compute", d: "Quality multiplier. Split 80 / 10 / 10." },
  { t: "Settle", d: "Instruction recorded. Reliability recomputed." },
];

const RIBBONS = [
  {
    t: "Discover",
    d: "A verified registry, not a directory.",
    href: "/registry",
    img: PHOTOS.ribbonYard,
    index: "01",
  },
  {
    t: "Deliver",
    d: "Evidence at the point of action.",
    href: "/whatsapp",
    img: PHOTOS.hero,
    index: "02",
  },
  {
    t: "Finance",
    d: "Credit priced off work, not a form.",
    href: "/finance",
    img: PHOTOS.ribbonEstate,
    index: "03",
  },
];

export default async function LandingPage() {
  let entities = 180;
  let claims = 900;
  let counties = 8;
  try {
    const [e, v, c] = await Promise.all([
      prisma.entity.count({ where: { verification: "VERIFIED" } }),
      prisma.claim.count(),
      prisma.entity.findMany({ select: { countyCode: true }, distinct: ["countyCode"] }),
    ]);
    entities = e;
    claims = v;
    counties = c.length;
  } catch {
    /* static fallbacks */
  }

  return (
    <>
      <SiteNav overlay />
      <section className="mk-hero">
        <div
          className="mk-hero__media"
          style={{ backgroundImage: `url('${PHOTOS.hero}')` }}
          aria-hidden
        />
        <div className="mk-hero__shade" aria-hidden />
        <div className="mk-hero__grain" aria-hidden />
        <div className="container mk-hero__inner">
          <p className="mk-brand">{BRAND.name}</p>
          <div className="mk-hero__rule" />
          <h1>{COPY.landing.headline}</h1>
          <p className="mk-hero__sub">{COPY.landing.sub}</p>
          <div className="jump">
            <Link href="/registry" className="btn btn-lime">
              {COPY.landing.ctaRegistry}
              <span className="node">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <PendingLink href="/whatsapp" className="btn btn-ghost-light" pendingLabel="Opening…">
              {COPY.landing.ctaWhatsapp}
            </PendingLink>
          </div>
        </div>
      </section>

      <section className="mk-problem scroll-margin-nav">
        <span className="mk-problem__big" aria-hidden>
          {BRAND.name}
        </span>
        <div className="container mk-problem__grid">
          <Reveal>
            <p className="label dark">The problem</p>
            <h2 className="mt-4 font-display text-[clamp(28px,4vw,48px)] font-bold tracking-[-0.03em] text-[#0E1F1A]">
              Three actors. One missing layer.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] text-[#5A6B60]">{COPY.landing.problemCitizen}</p>
          </Reveal>
          <aside className="mk-problem__aside">
            <Reveal delay={1}>
              <p className="font-display text-lg font-bold text-[#0E1F1A]">Enterprise</p>
              <p className="mt-2 text-sm text-[#5A6B60]">{COPY.landing.problemEnterprise}</p>
            </Reveal>
            <Reveal delay={2} className="mt-8 block">
              <p className="font-display text-lg font-bold text-[#0E1F1A]">The state</p>
              <p className="mt-2 text-sm text-[#5A6B60]">{COPY.landing.problemState}</p>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="mk-flow scroll-margin-nav" id="loop">
        <div className="container relative z-[1]">
          <Reveal>
            <p className="label">The loop</p>
            <h2 className="mt-3 font-display text-[clamp(28px,4vw,44px)] font-bold">
              From delivery to settlement
            </h2>
          </Reveal>
          <div className="mk-rail mt-12">
            {LOOP.map((step, i) => (
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

      {RIBBONS.map((mod, i) => (
        <section key={mod.t} className={`mk-ribbon mk-ribbon--cut ${i % 2 ? "reverse" : ""}`}>
          <div className="mk-ribbon__copy">
            <Reveal>
              <p className="mk-index">{mod.index}</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#0E1F1A]">{mod.t}</h2>
              <p className="mt-3 max-w-md text-[#5A6B60]">{mod.d}</p>
              <PendingLink href={mod.href} className="btn btn-dark mt-6" pendingLabel="Opening…">
                Open {mod.t}
                <span className="node">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </PendingLink>
            </Reveal>
          </div>
          <div className="mk-ribbon__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mod.img} alt="" />
          </div>
        </section>
      ))}

      <div className="mk-slash" />

      <section className="mk-statement">
        <div className="container">
          <Reveal>
            <h2>
              Housing is vertical one. The layer underneath is <span>sector-agnostic</span>.
            </h2>
          </Reveal>
          <div className="mk-metrics">
            <div>
              <p className="text-[11px] font-semibold text-white/60">Verified entities</p>
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{entities}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/60">Evidenced deliveries</p>
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{claims}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/60">Counties covered</p>
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{counties}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container relative z-[1]">
          <p className="font-display max-w-[16ch] text-[clamp(28px,4vw,48px)] font-bold leading-tight text-[#0E1F1A]">
            {COPY.landing.ctaBand}
          </p>
          <div className="jump mt-8">
            <Link href="/registry" className="btn btn-dark">
              See the live registry
              <span className="node">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link href="/build" className="btn btn-ghost-dark border-[#0E1F1A] text-[#0E1F1A]">
              I want to build
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
