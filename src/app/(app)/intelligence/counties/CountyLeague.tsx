"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatKes, formatNumber } from "@/lib/format";

type Row = {
  code: string;
  name: string;
  claims: number;
  suppliers: number;
  value: number;
  topItem: string;
  topEntity: string;
};

export function CountyLeague({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<Row | null>(null);
  return (
    <>
      <ol className="space-y-3">
        {rows.map((row, i) => (
          <li key={row.code}>
            <button
              type="button"
              onClick={() => setOpen(row)}
              className="w-full rounded-lg border border-line bg-surface p-4 text-left"
            >
              <p className="text-xs text-ink-400">#{i + 1}</p>
              <p className="font-display text-lg font-semibold">{row.name}</p>
              <p className="text-sm text-ink-600">
                {formatNumber(row.claims)} claims · {row.suppliers} suppliers · {formatKes(row.value)}
              </p>
              <p className="mt-1 text-xs text-ink-400">Top item {row.topItem}</p>
            </button>
          </li>
        ))}
      </ol>
      <Sheet open={!!open} onOpenChange={() => setOpen(null)}>
        <SheetContent>
          {open ? (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>
                  {formatNumber(open.claims)} evidenced deliveries
                </SheetDescription>
              </SheetHeader>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-ink-400">Suppliers</dt>
                  <dd className="tabular-nums">{open.suppliers}</dd>
                </div>
                <div>
                  <dt className="text-ink-400">Value settled</dt>
                  <dd className="tabular-nums">{formatKes(open.value)}</dd>
                </div>
                <div>
                  <dt className="text-ink-400">Top item</dt>
                  <dd>{open.topItem}</dd>
                </div>
                <div>
                  <dt className="text-ink-400">Top entity</dt>
                  <dd>{open.topEntity}</dd>
                </div>
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
