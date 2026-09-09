import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "WhatsApp demo",
};

export default function WhatsAppPage() {
  return (
    <div className="relative min-h-svh bg-forest-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-forest-800) 1px, transparent 1px), linear-gradient(90deg, var(--color-forest-800) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex min-h-svh w-full max-w-[1400px] flex-col items-center justify-center px-4 py-12">
        <div className="h-[3px] w-9 rounded-full bg-lime-500" />
        <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-100/70">
          Phase 5
        </p>
        <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-[-0.02em]">
          WhatsApp delivery flow
        </h1>
        <p className="mt-3 max-w-lg text-center text-sm leading-relaxed text-forest-100">
          The phone frame, scripted housing.delivery.v1 conversation, edge-check
          animation and live system-view panel are built in Phase 5. The route
          is live so the sidebar link works today.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="accent">
            <Link href="/registry">Open the registry</Link>
          </Button>
          <Button asChild variant="darkGhost">
            <Link href="/">Back to landing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
