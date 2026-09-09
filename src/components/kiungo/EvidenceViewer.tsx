"use client";

import { useState } from "react";
import type { EdgeCheck, Evidence } from "@prisma/client";
import { formatDateTimeAbsolute, formatHashPrefix, formatLatLng } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EvidenceViewer({
  evidence,
  checks,
  claimRef,
}: {
  evidence: Evidence[];
  checks: EdgeCheck[];
  claimRef: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const photo = evidence[0];
  return (
    <div className="space-y-3">
      {evidence.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setOpen(item.id)}
          className="w-full overflow-hidden rounded-lg border border-line text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={`Delivery evidence for ${claimRef}`}
            className="h-56 w-full object-cover bg-forest-100"
          />
          <div className="grid grid-cols-2 gap-2 bg-forest-50 p-3 font-mono text-[11px] tabular-nums text-ink-600 md:grid-cols-4">
            <span>Captured {item.capturedAt ? formatDateTimeAbsolute(item.capturedAt) : "—"}</span>
            <span>
              EXIF{" "}
              {item.exifLat != null && item.exifLng != null
                ? formatLatLng(item.exifLat, item.exifLng)
                : "none"}
            </span>
            <span>Hash {formatHashPrefix(item.sha256)}</span>
            <span>{item.deviceHint ?? "device"}</span>
          </div>
        </button>
      ))}
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.id}
            className={cn(
              "rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              check.passed ? "bg-lime-100 text-lime-700" : "bg-clay-100 text-clay-500",
            )}
          >
            {check.passed ? "Pass" : "Fail"} · {check.check.replaceAll("_", " ")}
          </span>
        ))}
      </div>
      {open && photo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4"
          onClick={() => setOpen(null)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)}
          role="dialog"
          aria-label="Evidence lightbox"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.find((e) => e.id === open)?.url ?? photo.url}
            alt={`Delivery evidence for ${claimRef}`}
            className="max-h-[90vh] max-w-full rounded-lg"
          />
        </div>
      ) : null}
    </div>
  );
}
