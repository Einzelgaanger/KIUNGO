"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITES, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { appendWalkParams } from "@/lib/walkthroughs";
import { cn } from "@/lib/utils";

export function IntelligenceControls({
  weeks,
  county,
  site,
  walkSlug,
  walkStep,
}: {
  weeks: string;
  county: string;
  site: string;
  walkSlug?: string;
  walkStep?: string;
}) {
  const router = useRouter();
  const q = (next: { weeks?: string; county?: string; site?: string }) => {
    const params = new URLSearchParams();
    params.set("weeks", next.weeks ?? weeks);
    if ((next.county ?? county) !== "all") params.set("county", next.county ?? county);
    if ((next.site ?? site) !== "all") params.set("site", next.site ?? site);
    return appendWalkParams(`/intelligence?${params.toString()}`, walkSlug, walkStep);
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
        value={county}
        onChange={(e) => {
          router.push(q({ county: e.target.value }));
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
        value={site}
        onChange={(e) => {
          router.push(q({ site: e.target.value }));
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
      <Link
        href={appendWalkParams("/intelligence/materials", walkSlug, walkStep)}
        className="inline-flex min-h-11 items-center text-sm underline"
      >
        Materials
      </Link>
      <Link
        href={appendWalkParams("/intelligence/counties", walkSlug, walkStep)}
        className="inline-flex min-h-11 items-center text-sm underline"
      >
        Counties
      </Link>
    </div>
  );
}
