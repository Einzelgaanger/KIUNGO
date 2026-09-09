import { COPY } from "@/lib/constants";

export function PhasePlaceholder({
  phase,
  title,
  purpose,
  eyebrow,
}: {
  phase: number;
  title: string;
  purpose: string;
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <div className="h-[3px] w-9 rounded-full bg-lime-500" />
      <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        {eyebrow ?? `Phase ${phase}`}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900 md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-600">
        {purpose} This route is wired in the shell now and is filled in Phase {phase} of
        the build specification.
      </p>
      <p className="mt-8 text-xs text-ink-400">{COPY.landing.footerNote}</p>
    </div>
  );
}
