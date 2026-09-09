import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";

export default function LandingPage() {
  return (
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
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-lime-500/8 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <div className="h-[3px] w-9 rounded-full bg-lime-500" />
        <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-100/70">
          {COPY.landing.eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] md:text-7xl">
          {COPY.landing.headline}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-forest-100 md:text-base">
          {COPY.landing.sub}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="accent" size="lg">
            <Link href="/registry">{COPY.landing.ctaRegistry}</Link>
          </Button>
          <Button asChild variant="darkGhost" size="lg">
            <Link href="/whatsapp">{COPY.landing.ctaWhatsapp}</Link>
          </Button>
        </div>
        <p className="mt-12 max-w-xl text-sm text-forest-100/70">
          The full landing — loop diagram, modules and closing band — ships in
          Phase 7. The shells and the live registry route are already open.
        </p>
      </div>
    </section>
  );
}
