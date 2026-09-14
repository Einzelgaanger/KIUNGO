import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/marketing/SiteNav";
import { getWalkthrough, nextWalkthrough, WALKTHROUGHS, hrefPathname } from "@/lib/walkthroughs";
import { DEMO_PERSONAS, ROLE_LABELS } from "@/lib/constants";

export function generateStaticParams() {
  return WALKTHROUGHS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWalkthrough(slug);
  if (!item) return { title: "Walkthrough" };
  return {
    title: item.title,
    description: item.promise,
  };
}

export default async function WalkthroughDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWalkthrough(slug);
  if (!item) notFound();
  const first = item.steps[0];
  const following = nextWalkthrough(item.slug);

  return (
    <>
      <SiteNav />
      <article className="bg-[#F3FAF5] pb-20">
        <header className="container py-16 md:py-20">
          <p className="label dark">
            {item.index} · {item.minutes} · {item.steps.length} steps
          </p>
          <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(32px,5vw,56px)] font-bold tracking-[-0.03em] text-[#0E1F1A]">
            {item.title}
          </h1>
          <p className="mt-4 text-sm font-semibold text-[#0E1F1A]">
            {item.person}
            <span className="font-normal text-[#5A6B60]"> · {item.role}</span>
          </p>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#5A6B60]">{item.promise}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5A6B60]">{item.setup}</p>
          {first ? (
            <Link href={`/walkthrough/go/${item.slug}`} className="btn btn-dark mt-8">
              Start on the live screens
              <span className="node">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ) : null}
        </header>

        <ol className="container max-w-3xl space-y-6">
          {item.steps.map((step, i) => {
            const persona = DEMO_PERSONAS.find((p) => p.id === step.personaId);
            return (
              <li
                key={step.id}
                className="rounded-2xl border border-[#E3E7E0] bg-white p-5 shadow-[0_8px_28px_rgba(14,31,26,0.05)] md:p-7"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5A6B60]">
                  Step {i + 1}
                  {persona ? ` · ${persona.name} · ${ROLE_LABELS[persona.role]}` : null}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-[#0E1F1A]">{step.title}</h2>
                <p className="mt-1 font-mono text-[11px] text-[#5A6B60]">{hrefPathname(step.href)}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5A6B60]">{step.do}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0E1F1A]">
                  Must be true on screen
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-[#5A6B60]">
                  {step.lookFor.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#D3F36B]" />
                      {line}
                    </li>
                  ))}
                </ul>
                {step.note ? (
                  <p className="mt-4 rounded-lg bg-[#F4FBE3] px-3 py-2 text-[13px] leading-relaxed text-[#0E1F1A]">
                    {step.note}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="container mt-12 max-w-3xl">
          <p className="font-display text-lg font-bold text-[#0E1F1A]">When you finish</p>
          <p className="mt-2 text-sm leading-relaxed text-[#5A6B60]">{item.outcome}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/walkthrough/go/${item.slug}`} className="btn btn-dark">
              Run it now
            </Link>
            <Link href="/walkthrough" className="btn btn-ghost-dark border-[#0E1F1A]/20 text-[#0E1F1A]">
              All walkthroughs
            </Link>
            {following ? (
              <Link href={`/walkthrough/go/${following.slug}`} className="btn btn-ghost-dark border-[#0E1F1A]/20 text-[#0E1F1A]">
                Next: {following.title}
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}
