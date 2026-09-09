import Link from "next/link";
import { Building2, Landmark, ShieldCheck, Users } from "lucide-react";
import { EntityCard } from "@/components/kiungo/EntityCard";
import { TrustRail } from "@/components/kiungo/TrustRail";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";

const LOOP = ["Submit", "Verify", "Route", "Review", "Compute", "Settle"];
const VERTICALS = ["Housing", "Tourism", "Agriculture", "Health", "Education"];

export default async function LandingPage() {
  let entities = 180;
  let claims = 900;
  let counties = 8;
  let featured: Awaited<ReturnType<typeof prisma.entity.findMany>> = [];
  try {
    const [e, v, c, f] = await Promise.all([
      prisma.entity.count({ where: { verification: "VERIFIED" } }),
      prisma.claim.count(),
      prisma.entity.findMany({ select: { countyCode: true }, distinct: ["countyCode"] }),
      prisma.entity.findMany({
        where: { category: "FABRICATOR", verification: "VERIFIED" },
        include: { certifications: true, _count: { select: { claims: true } } },
        take: 3,
        orderBy: { reliability: "desc" },
      }),
    ]);
    entities = e;
    claims = v;
    counties = c.length;
    featured = f;
  } catch {
    /* static fallbacks */
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-forest-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-forest-800) 1px, transparent 1px), linear-gradient(90deg, var(--color-forest-800) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-lime-500/8 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          <div className="h-[3px] w-9 rounded-full bg-lime-500" />
          <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-100/70">
            {COPY.landing.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] md:text-7xl">
            {COPY.landing.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-forest-100 md:text-base">{COPY.landing.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/registry">{COPY.landing.ctaRegistry}</Link>
            </Button>
            <Button asChild variant="darkGhost" size="lg">
              <Link href="/whatsapp">{COPY.landing.ctaWhatsapp}</Link>
            </Button>
          </div>
          <TrustRail entities={entities} claims={claims} counties={counties} />
        </div>
      </section>

      <section className="bg-forest-900 py-16">
        <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 md:grid-cols-3 md:px-8">
          {[
            { icon: Users, title: "A citizen who wants to build.", body: COPY.landing.problemCitizen, n: "2m" },
            { icon: Building2, title: "An enterprise that wants to supply.", body: COPY.landing.problemEnterprise, n: "30,016" },
            { icon: Landmark, title: "A state that cannot see.", body: COPY.landing.problemState, n: "271,000" },
          ].map((card) => (
            <div key={card.title} className="rounded-lg border border-forest-700 bg-forest-800 p-6">
              <card.icon className="h-5 w-5 text-lime-500" />
              <h2 className="mt-4 font-display text-lg font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-forest-100">{card.body}</p>
              <p className="mt-4 font-display text-3xl font-bold tabular-nums text-lime-500">{card.n}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-forest-950 py-16">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <div className="h-[3px] w-9 rounded-full bg-lime-500" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-100/70">The loop</p>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            {LOOP.map((step, i) => (
              <div key={step} className="flex flex-1 items-center gap-3">
                <div className="w-full rounded-lg bg-forest-800 p-4">
                  <p className="font-display text-2xl font-bold text-lime-500">{i + 1}</p>
                  <p className="mt-1 font-medium">{step}</p>
                </div>
                {i < LOOP.length - 1 ? <span className="hidden text-lime-500 md:block">→</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-900 py-16">
        <div className="mx-auto w-full max-w-[1400px] space-y-10 px-4 md:px-8">
          {[
            { t: "Discover", d: "A verified registry, not a directory.", href: "/registry", panel: "registry" },
            { t: "Deliver", d: "Evidence at the point of action.", href: "/whatsapp", panel: "deliver" },
            { t: "Finance", d: "Credit priced off work, not a form.", href: "/finance", panel: "finance" },
            { t: "Opportunities", d: "Packages matched with reasons.", href: "/opportunities", panel: "opps" },
            { t: "Intelligence", d: "A live instrument panel for the programme.", href: "/intelligence", panel: "intel" },
          ].map((mod, i) => (
            <div key={mod.t} className={`grid items-center gap-6 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div>
                <div className="h-[3px] w-9 rounded-full bg-lime-500" />
                <h2 className="mt-3 font-display text-3xl font-bold">{mod.t}</h2>
                <p className="mt-3 text-forest-100">{mod.d}</p>
                <Button asChild variant="accent" className="mt-4">
                  <Link href={mod.href}>Open {mod.t}</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-forest-700 bg-paper p-4 text-ink-900">
                {mod.panel === "registry" && featured.length > 0 ? (
                  <div className="space-y-3">
                    {featured.map((entity) => (
                      <EntityCard key={entity.id} entity={entity} variant="compact" />
                    ))}
                  </div>
                ) : (
                  <pre className="overflow-x-auto font-mono text-xs text-ink-600">
                    {mod.panel === "deliver"
                      ? "CLM-2026-004821  QUEUED\nMukuru Phase 2 · 84 m\nDR-STL-900 × 40"
                      : mod.panel === "finance"
                        ? "Reliability 78 · Verified\n3 of 9 products available"
                        : mod.panel === "opps"
                          ? "Steel door frames · Nairobi\nReserved: Youth · Women\nWhy: county + category + tag"
                          : "Deliveries 16w  ·  900\nValue settled  ·  live\nNeeds attention  ·  queue"}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-forest-950 py-16">
        <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 md:grid-cols-2 md:px-8">
          {["Verified certification", "Evidenced delivery", "Deterministic settlement", "Machine-readable registry"].map((claim) => (
            <div key={claim} className="flex items-start gap-3 rounded-lg border border-forest-800 p-5">
              <ShieldCheck className="h-5 w-5 text-lime-500" />
              <p className="font-medium">{claim}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-forest-900 py-12">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap gap-3 px-4 md:px-8">
          {VERTICALS.map((v) => (
            <span key={v} className="rounded-pill border border-forest-700 px-4 py-2 text-sm">
              {v}
            </span>
          ))}
          <p className="w-full text-sm text-forest-100/70">Housing is vertical one. The layer underneath is sector-agnostic.</p>
        </div>
      </section>

      <section className="bg-lime-500 py-16 text-forest-900">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <p className="font-display text-3xl font-bold md:text-4xl">{COPY.landing.ctaBand}</p>
        </div>
      </section>
    </div>
  );
}
