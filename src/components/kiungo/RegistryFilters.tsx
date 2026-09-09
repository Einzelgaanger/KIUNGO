"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CountyFilter } from "@/components/kiungo/CountyFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ENTITY_CATEGORY_LABELS, OWNERSHIP_TAG_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { parseList } from "@/lib/entities";

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function RegistryFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string | string[] | number | boolean | undefined) {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (value === undefined || value === "" || value === false || (Array.isArray(value) && value.length === 0)) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.set(key, value.join(","));
    } else {
      next.set(key, String(value));
    }
    router.push(`/registry?${next.toString()}`);
  }

  const categories = parseList(params.get("category") ?? undefined);
  const verification = parseList(params.get("verification") ?? undefined);
  const ownership = parseList(params.get("ownership") ?? undefined);
  const counties = parseList(params.get("county") ?? undefined);

  return (
    <div className="sticky top-0 z-20 space-y-3 border-b border-line bg-paper/95 py-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Search name, trade or item"
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", e.currentTarget.value);
          }}
          onBlur={(e) => setParam("q", e.currentTarget.value)}
        />
        <CountyFilter value={counties} onChange={(codes) => setParam("county", codes)} />
        <select
          className="h-11 rounded-md border border-line bg-surface px-3 text-sm"
          value={params.get("sort") ?? "reliability"}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          <option value="reliability">Reliability</option>
          <option value="deliveries">Most deliveries</option>
          <option value="verified">Recently verified</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(ENTITY_CATEGORY_LABELS).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={categories.includes(key) ? "default" : "outline"}
            onClick={() => setParam("category", toggle(categories, key))}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(VERIFICATION_STATUS_LABELS).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={verification.includes(key) ? "default" : "outline"}
            onClick={() => setParam("verification", toggle(verification, key))}
          >
            {label}
          </Button>
        ))}
        {Object.entries(OWNERSHIP_TAG_LABELS).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={ownership.includes(key) ? "default" : "outline"}
            onClick={() => setParam("ownership", toggle(ownership, key))}
          >
            {label}
          </Button>
        ))}
        <label className="ml-auto flex min-h-11 items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={params.get("hasDeliveries") === "1"}
            onChange={(e) => setParam("hasDeliveries", e.target.checked ? "1" : undefined)}
          />
          Has evidenced deliveries
        </label>
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Label htmlFor="minRel">Min reliability</Label>
          <input
            id="minRel"
            type="range"
            min={0}
            max={100}
            defaultValue={params.get("minReliability") ?? "0"}
            onMouseUp={(e) => setParam("minReliability", Number(e.currentTarget.value) || undefined)}
            onTouchEnd={(e) => setParam("minReliability", Number(e.currentTarget.value) || undefined)}
          />
        </div>
      </div>
    </div>
  );
}
