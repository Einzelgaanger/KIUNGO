"use client";

import { COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ScoreBreakdown } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function band(score: number) {
  if (score <= 39) return "bg-clay-100 text-clay-500";
  if (score <= 69) return "bg-gold-100 text-gold-500";
  return "bg-lime-100 text-lime-700";
}

function fill(score: number, index: number) {
  const threshold = (index + 1) * 20;
  return score >= threshold;
}

export function ReliabilityScore({
  score,
  breakdown,
  size = "sm",
}: {
  score: number | null;
  breakdown?: ScoreBreakdown;
  size?: "sm" | "lg";
}) {
  if (score == null) {
    return (
      <span className="inline-flex items-center rounded-pill bg-line-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        Insufficient history
      </span>
    );
  }

  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-2.5 py-1 tabular-nums",
        band(score),
        size === "lg" ? "text-sm font-semibold" : "text-[11px] font-semibold uppercase tracking-wide",
      )}
    >
      {size === "lg" ? `Reliability ${score}` : score}
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-2 rounded-sm",
              fill(score, i) ? "bg-current" : "bg-current/25",
            )}
          />
        ))}
      </span>
    </span>
  );

  if (!breakdown) return chip;

  return (
    <Popover>
      <PopoverTrigger className="min-h-11">{chip}</PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="text-sm font-medium text-ink-900">
          {COPY.score.withHistory
            .replace("{score}", String(score))
            .replace("{n}", String(breakdown.completedDeliveries))
            .replace("{sites}", String(breakdown.siteCount))
            .replace(
              "{date}",
              breakdown.since
                ? breakdown.since.toLocaleDateString("en-KE", {
                    month: "long",
                    year: "numeric",
                  })
                : "this year",
            )}
        </p>
        <ul className="mt-3 space-y-2">
          {(
            [
              ["On-time delivery", breakdown.onTime],
              ["Evidence quality", breakdown.evidenceQuality],
              ["Query rate", breakdown.queryRate],
              ["Volume consistency", breakdown.volumeConsistency],
            ] as const
          ).map(([label, value]) => (
            <li key={label}>
              <div className="flex justify-between text-xs text-ink-600">
                <span>{label}</span>
                <span className="tabular-nums">{value}/25</span>
              </div>
              <div className="mt-1 h-1.5 rounded-pill bg-line-soft">
                <div
                  className="h-full rounded-pill bg-forest-900"
                  style={{ width: `${(value / 25) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
