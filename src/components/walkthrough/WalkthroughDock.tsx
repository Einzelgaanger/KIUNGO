"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { switchPersona } from "@/actions/session";
import { DEMO_PERSONAS, ROLE_LABELS } from "@/lib/constants";
import {
  clampStep,
  getWalkthrough,
  stepMatches,
  withWalkQuery,
  type Walkthrough,
} from "@/lib/walkthroughs";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "kiungo_wt";

type Stored = { slug: string; step: number };

function readStored(): Stored | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (!raw.startsWith("{")) {
      const walkthrough = getWalkthrough(raw);
      return walkthrough ? { slug: raw, step: 0 } : null;
    }
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.slug || !getWalkthrough(parsed.slug)) return null;
    return { slug: parsed.slug, step: parsed.step ?? 0 };
  } catch {
    return null;
  }
}

function writeStored(slug: string, step: number) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ slug, step }));
}

export function WalkthroughDock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => {
    const fromUrl = searchParams.get("wt");
    const stepRaw = searchParams.get("wts");
    const parsedStep = stepRaw == null || stepRaw === "" ? Number.NaN : Number.parseInt(stepRaw, 10);

    if (fromUrl && getWalkthrough(fromUrl)) {
      const walkthrough = getWalkthrough(fromUrl)!;
      const stored = readStored();
      const nextStep = clampStep(
        walkthrough,
        Number.isFinite(parsedStep) ? parsedStep : stored?.slug === fromUrl ? stored.step : 0,
      );
      writeStored(fromUrl, nextStep);
      setSlug(fromUrl);
      setStepIndex(nextStep);
      setOpen(true);
      return;
    }

    const stored = readStored();
    if (stored && getWalkthrough(stored.slug)) {
      setSlug(stored.slug);
      setStepIndex(clampStep(getWalkthrough(stored.slug)!, stored.step));
    }
  }, [searchParams]);

  const walkthrough = slug ? getWalkthrough(slug) : undefined;
  const step = walkthrough?.steps[stepIndex];

  function dismiss() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSlug(null);
  }

  function finish() {
    const done = slug;
    dismiss();
    if (done) router.push(`/walkthrough/${done}`);
  }

  function go(next: Walkthrough["steps"][number] | undefined, nextIndex: number) {
    if (!walkthrough || !next) return;
    start(async () => {
      const result = await switchPersona({ userId: next.personaId });
      if (!result.ok) return;
      writeStored(walkthrough.slug, nextIndex);
      setStepIndex(nextIndex);
      router.push(withWalkQuery(next.href, walkthrough.slug, nextIndex));
      router.refresh();
    });
  }

  const persona = useMemo(
    () => DEMO_PERSONAS.find((item) => item.id === step?.personaId),
    [step?.personaId],
  );

  if (!walkthrough || !step || pathname.startsWith("/walkthrough")) return null;

  const last = stepIndex === walkthrough.steps.length - 1;
  const onScreen = stepMatches(step.href, pathname);

  return (
    <aside
      className={cn(
        "fixed z-[70] w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl border border-white/12 bg-[#0E1F1A] text-white shadow-2xl",
        "bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] right-3 lg:bottom-4 lg:right-4",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D3F36B]">
            Walkthrough {walkthrough.index} · {walkthrough.minutes}
          </p>
          <p className="mt-1 font-display text-sm font-bold leading-snug">{walkthrough.title}</p>
        </div>
        <button type="button" className="touch-target text-white/60 hover:text-white" onClick={dismiss} aria-label="Exit walkthrough">
          <X className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="max-h-[min(62dvh,28rem)] overflow-y-auto px-4 py-3">
          <div className="flex gap-1" aria-hidden>
            {walkthrough.steps.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i <= stepIndex ? "bg-[#D3F36B]" : "bg-white/15",
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/55">
            Step {stepIndex + 1} of {walkthrough.steps.length}
            {persona ? ` · You are ${persona.name}, ${ROLE_LABELS[persona.role]}` : null}
          </p>
          <p className="mt-2 font-display text-base font-semibold">{step.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">{step.do}</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D3F36B]">
            Must be true on screen
          </p>
          <ul className="mt-2 space-y-1.5 text-[12px] text-white/70">
            {step.lookFor.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#D3F36B]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {step.note ? (
            <p className="mt-3 rounded-lg bg-white/6 px-3 py-2 text-[11px] leading-relaxed text-[#F0C419]">{step.note}</p>
          ) : null}
          {!onScreen ? (
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-[#D3F36B]/40 px-3 py-2 text-left text-[12px] font-semibold text-[#D3F36B]"
              disabled={pending}
              onClick={() => go(step, stepIndex)}
            >
              Open this screen
            </button>
          ) : null}
        </div>
      ) : (
        <button type="button" className="w-full px-4 py-2 text-left text-xs text-white/70" onClick={() => setOpen(true)}>
          Show step {stepIndex + 1}: {step.title}
        </button>
      )}

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-30"
          disabled={stepIndex === 0 || pending}
          onClick={() => go(walkthrough.steps[stepIndex - 1], stepIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button type="button" className="text-xs text-white/45 hover:text-white" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          className="ml-auto inline-flex h-10 items-center gap-1 rounded-xl bg-[#D3F36B] px-4 text-xs font-bold text-[#0E1F1A] disabled:opacity-50"
          disabled={pending}
          onClick={() => (last ? finish() : go(walkthrough.steps[stepIndex + 1], stepIndex + 1))}
        >
          {last ? "Finish" : "Next"}
          {last ? null : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
