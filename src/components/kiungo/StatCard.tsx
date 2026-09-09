"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

function animateNumber(value: number, duration = 600): number[] {
  const frames = Math.max(8, Math.round(duration / 32));
  return Array.from({ length: frames + 1 }, (_, i) =>
    Math.round(value * (i / frames)),
  );
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaIsGood,
  hint,
  tone = "light",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; direction: "up" | "down" | "flat"; label: string };
  deltaIsGood?: boolean;
  hint?: string;
  tone?: "light" | "dark";
  icon?: LucideIcon;
}) {
  const numeric = typeof value === "number";
  const [shown, setShown] = useState(numeric ? 0 : value);

  useEffect(() => {
    if (!numeric) {
      setShown(value);
      return;
    }
    const frames = animateNumber(value);
    let i = 0;
    const id = window.setInterval(() => {
      const next = frames[i];
      if (next === undefined) {
        window.clearInterval(id);
        setShown(value);
        return;
      }
      setShown(next);
      i += 1;
    }, 32);
    return () => window.clearInterval(id);
  }, [numeric, value]);

  const DeltaIcon =
    delta?.direction === "up"
      ? ArrowUpRight
      : delta?.direction === "down"
        ? ArrowDownRight
        : ArrowRight;
  const deltaColor =
    delta?.direction === "flat"
      ? tone === "dark"
        ? "text-forest-100/70"
        : "text-ink-400"
      : deltaIsGood
        ? "text-lime-700"
        : "text-clay-500";

  return (
    <div
      className={cn(
        "rounded-lg border p-5 shadow-xs md:p-6",
        tone === "dark"
          ? "border-forest-700 bg-forest-900 text-white"
          : "border-line bg-surface text-ink-900",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "font-sans text-[11px] font-semibold uppercase tracking-[0.14em]",
            tone === "dark" ? "text-forest-100/70" : "text-ink-400",
          )}
        >
          {label}
        </p>
        {Icon ? (
          <Icon
            className={cn("h-4 w-4", tone === "dark" ? "text-lime-500" : "text-ink-400")}
          />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-3 font-display text-3xl font-bold tabular-nums tracking-[-0.02em] md:text-4xl",
          tone === "dark" && "text-lime-500",
        )}
      >
        {shown}
        {unit ? <span className="ml-1 text-lg">{unit}</span> : null}
      </p>
      {delta ? (
        <p className={cn("mt-2 inline-flex items-center gap-1 text-xs tabular-nums", deltaColor)}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {delta.value}% {delta.label}
        </p>
      ) : null}
      {hint ? (
        <p
          className={cn(
            "mt-2 text-xs",
            tone === "dark" ? "text-forest-100/70" : "text-ink-400",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
