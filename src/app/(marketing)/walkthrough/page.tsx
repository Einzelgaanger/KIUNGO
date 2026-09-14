import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Reveal } from "@/components/marketing/Reveal";
import { WALKTHROUGHS } from "@/lib/walkthroughs";

export const metadata: Metadata = {
  title: "Live walkthroughs",
  description: "Run Kiungo as Amina, Daniel, Grace, Peter, Faith or Samuel. Real screens. Seeded people.",
};

export default function WalkthroughIndexPage() {
  return (
    <>
      <SiteNav />
      <section className="bg-[#F3FAF5] py-16 md:py-24">
        <div className="container">
          <p className="label dark">Live scenarios</p>
          <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(32px,5vw,64px)] font-bold tracking-[-0.03em] text-[#0E1F1A]">
            Six people. One loop. You click.
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#5A6B60]">
            Government reviewers should not watch a deck. Start a walkthrough. The product switches persona,
            opens the live page, and a dock tells you what to do and what must be true on the seeded data.
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#0E1F1A]">
            Briefing order: Amina (the loop) → Grace (the buyer) → Daniel (the queue) → Peter (the lock) →
            Faith (the programme) → Samuel (credit). Nine minutes on Amina is the whole product.
          </p>
        </div>
      </section>
      <section className="mk-walk mk-walk--page">
        <div className="container">
          <div className="mk-walk__grid">
            {WALKTHROUGHS.map((item, i) => (
              <Reveal key={item.slug} delay={(Math.min(i, 4) || undefined) as 1 | 2 | 3 | 4 | undefined}>
                <article className="mk-walk__card">
                  <p className="mk-walk__meta">
                    {item.index} · {item.minutes}
                  </p>
                  <h3>{item.title}</h3>
                  <p className="mk-walk__who">
                    {item.person}
                    <span> · {item.role}</span>
                  </p>
                  <p className="mk-walk__promise">{item.promise}</p>
                  <ol className="mk-walk__steps">
                    {item.steps.map((step, n) => (
                      <li key={step.id}>
                        <span>{n + 1}</span>
                        {step.title}
                      </li>
                    ))}
                  </ol>
                  <div className="mk-walk__actions">
                    <Link href={`/walkthrough/go/${item.slug}`} className="btn btn-dark">
                      Start as {item.person.split(" ")[0]}
                      <span className="node">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                    <Link href={`/walkthrough/${item.slug}`} className="btn btn-ghost-dark border-[#0E1F1A]/20 text-[#0E1F1A]">
                      Full script
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
