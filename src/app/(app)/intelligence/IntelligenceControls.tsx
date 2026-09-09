"use client";

import Link from "next/link";
import { SITES, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function IntelligenceControls({
  weeks,
  county,
  site,
}: {
  weeks: string;
  county: string;
  site: string;
}) {
  const q = (next: { weeks?: string; county?: string; site?: string }) => {
    const params = new URLSearchParams();
    params.set("weeks", next.weeks ?? weeks);
    if ((next.county ?? county) !== "all") params.set("county", next.county ?? county);
    if ((next.site ?? site) !== "all") params.set("site", next.site ?? site);
    return `/intelligence?${params.toString()}`;
  };
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {(["4", "8", "16", "all"] as const).map((w) => (
        <Link
          key={w}
          href={q({ weeks: w })}
          className={cn(
            "inline-flex min-h-11 items-center rounded-md border px-3 text-sm",
            weeks === w ? "border-forest-900 bg-forest-900 text-white" : "border-line bg-surface",
          )}
        >
          {w === "all" ? "All" : `${w} weeks`}
        </Link>
      ))}
      <select
        className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm"
        defaultValue={county}
        onChange={(e) => {
          window.location.href = q({ county: e.target.value });
        }}
        aria-label="County"
      >
        <option value="all">All counties</option>
        {SEEDED_COUNTY_CODES.map((code) => (
          <option key={code} value={code}>
            {countyName(code)}
          </option>
        ))}
      </select>
      <select
        className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm"
        defaultValue={site}
        onChange={(e) => {
          window.location.href = q({ site: e.target.value });
        }}
        aria-label="Site"
      >
        <option value="all">All sites</option>
        {SITES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <Link href="/intelligence/materials" className="inline-flex min-h-11 items-center text-sm underline">
        Materials
      </Link>
      <Link href="/intelligence/counties" className="inline-flex min-h-11 items-center text-sm underline">
        Counties
      </Link>
    </div>
  );
}
