import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WALKTHROUGHS } from "@/lib/walkthroughs";
import { Reveal } from "@/components/marketing/Reveal";

export function WalkthroughBand() {
  return (
    <section className="mk-walk scroll-margin-nav" id="walkthroughs">
      <div className="container">
        <Reveal>
          <p className="label dark">Live scenarios</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-[#0E1F1A]">
            Walk the product as the people who use it.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#5A6B60]">
            These are not slides. Each walkthrough switches you into a seeded persona and opens the real screens.
            Do the clicks. Read what the page actually shows. That is the briefing.
          </p>
          <p className="mt-3 max-w-2xl text-[13px] font-semibold text-[#0E1F1A]">
            Start with Amina if you have nine minutes. Peter is the contrast. Faith is the national view.
          </p>
        </Reveal>
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
                <p className="mk-walk__count">{item.steps.length} live steps</p>
                <div className="mk-walk__actions">
                  <Link href={`/walkthrough/go/${item.slug}`} className="btn btn-dark">
                    Start
                    <span className="node">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <Link href={`/walkthrough/${item.slug}`} className="btn btn-ghost-dark border-[#0E1F1A]/20 text-[#0E1F1A]">
                    Read first
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
