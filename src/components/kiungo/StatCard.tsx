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

  const bar =
    tone === "dark"
      ? "bg-[#D3F36B]"
      : deltaIsGood === false
        ? "bg-red-600"
        : hint?.toLowerCase().includes("pending") || hint?.toLowerCase().includes("await")
          ? "bg-[#F0C419]"
          : "bg-[#D3F36B]";

  return (
    <div
      className={cn(
        "stat-card",
        tone === "dark" && "border-white/10 bg-[#0E1F1A] text-white",
      )}
    >
      <span className={cn("stat-card__bar", bar)} />
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-semibold text-[#5A6B7D]",
            tone === "dark" && "text-white/65",
          )}
        >
          {label}
        </p>
        {Icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D3F36B]/25">
            <Icon className="h-3.5 w-3.5 text-[#0E1F1A]" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 text-lg font-extrabold tabular-nums tracking-tight text-[#0E1F1A] sm:text-xl",
          tone === "dark" && "text-[#D3F36B]",
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
