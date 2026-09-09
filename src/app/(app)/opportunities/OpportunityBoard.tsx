"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { expressInterest } from "@/actions/opportunities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { countyName, SEEDED_COUNTY_CODES } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { differenceInHours } from "date-fns";

type Item = {
  id: string;
  ref: string;
  title: string;
  kind: string;
  buyerName: string;
  countyCode: string;
  valueEst: number | null;
  closesAt: string;
  reservedFor: string[];
  description: string;
  reasons: string[];
  score: number;
};

export function OpportunityBoard({ items }: { items: Item[] }) {
  const [kind, setKind] = useState("all");
  const [county, setCounty] = useState("all");
  const [reserved, setReserved] = useState("all");
  const [closing, setClosing] = useState("all");
  const [open, setOpen] = useState<Item | null>(null);
  const now = useMemo(() => new Date("2026-09-09T12:00:00.000Z"), []);

  const cards = useMemo(() => {
    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (county !== "all" && item.countyCode !== county) return false;
      if (reserved !== "all" && !item.reservedFor.includes(reserved)) return false;
      const hours = differenceInHours(new Date(item.closesAt), now);
      if (closing === "7d" && hours > 24 * 7) return false;
      if (closing === "48h" && hours > 48) return false;
      return true;
    });
  }, [items, kind, county, reserved, closing, now]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Kind">
          <option value="all">All kinds</option>
          <option value="TENDER">Tender</option>
          <option value="SUBCONTRACT">Subcontract</option>
          <option value="COMPONENT_ORDER">Component order</option>
          <option value="CITIZEN_REQUEST">Citizen request</option>
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={county} onChange={(e) => setCounty(e.target.value)} aria-label="County">
          <option value="all">All counties</option>
          {SEEDED_COUNTY_CODES.map((code) => (
            <option key={code} value={code}>{countyName(code)}</option>
          ))}
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={reserved} onChange={(e) => setReserved(e.target.value)} aria-label="Reserved for">
          <option value="all">Any reservation</option>
          <option value="YOUTH">Youth</option>
          <option value="WOMEN">Women</option>
          <option value="PWD">PWD</option>
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={closing} onChange={(e) => setClosing(e.target.value)} aria-label="Closing window">
          <option value="all">Any close date</option>
          <option value="7d">Closes in 7 days</option>
          <option value="48h">Closes in 48 hours</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const hours = differenceInHours(new Date(item.closesAt), now);
          const tone = hours < 48 ? "text-clay-500" : hours < 24 * 7 ? "text-gold-500" : "text-ink-600";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpen(item)}
              className="rounded-lg border border-line bg-surface p-5 text-left shadow-xs"
            >
              <Badge variant="outline">{item.kind.replaceAll("_", " ")}</Badge>
              <h3 className="mt-3 font-display text-base font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-600">
                {item.buyerName} · {countyName(item.countyCode)}
              </p>
              <p className="mt-2 tabular-nums">{item.valueEst ? formatKes(item.valueEst) : "Value on request"}</p>
              <p className={`mt-1 text-xs ${tone}`}>Closes in {Math.max(0, Math.round(hours / 24))} days</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.reservedFor.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-600">
                Why this matched you: {item.reasons.length > 0 ? item.reasons.join(" · ") : "Open to all suppliers"}
              </p>
            </button>
          );
        })}
      </div>
      {cards.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-600">
          Nothing matched your profile this week. Opportunities are matched on county, category, reserved-procurement status and reliability. Widen your filters to see everything open.
        </p>
      ) : null}
      <Sheet open={!!open} onOpenChange={() => setOpen(null)}>
        <SheetContent>
          {open ? (
            <>
              <SheetHeader>
                <SheetTitle>{open.title}</SheetTitle>
                <SheetDescription>
                  {open.ref} · {open.buyerName}
                </SheetDescription>
              </SheetHeader>
              <p className="mt-4 text-sm text-ink-600">{open.description}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {open.reasons.map((reason) => (
                  <li key={reason} className="text-lime-700">✓ {reason}</li>
                ))}
                {open.reasons.length === 0 ? (
                  <li className="text-ink-400">No reserved-procurement overlap on this package.</li>
                ) : null}
              </ul>
              <Button
                className="mt-6"
                onClick={async () => {
                  const result = await expressInterest({ opportunityId: open.id });
                  if (result.ok) toast.success("Interest recorded");
                }}
              >
                Express interest
              </Button>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
