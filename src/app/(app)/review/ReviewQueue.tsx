"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { batchApprove, decideClaim } from "@/actions/claims";
import { EvidenceViewer } from "@/components/kiungo/EvidenceViewer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Claim, ContractLine, EdgeCheck, Entity, Evidence, Site } from "@prisma/client";
import { formatRelative } from "@/lib/format";

type QueueItem = Claim & {
  entity: Entity;
  contractLine: ContractLine;
  site: Site;
  evidence: Evidence[];
  edgeChecks: EdgeCheck[];
};

export function ReviewQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const active = items.find((item) => item.id === activeId) ?? items[0];

  const grouped = useMemo(() => {
    const map = new Map<string, QueueItem[]>();
    for (const item of items) {
      const list = map.get(item.site.name) ?? [];
      list.push(item);
      map.set(item.site.name, list);
    }
    return map;
  }, [items]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      const idx = items.findIndex((item) => item.id === active.id);
      if (e.key === "j" || e.key === "J") setActiveId(items[Math.min(items.length - 1, idx + 1)]?.id ?? active.id);
      if (e.key === "k" || e.key === "K") setActiveId(items[Math.max(0, idx - 1)]?.id ?? active.id);
      if (e.key === "a" || e.key === "A") decide("APPROVE");
      if (e.key === "q" || e.key === "Q") decide("QUERY");
      if (e.key === "r" || e.key === "R") decide("REJECT");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, comment, items]);

  function decide(decision: "APPROVE" | "QUERY" | "REJECT") {
    if (!active) return;
    if (decision !== "APPROVE" && !comment) {
      toast.error("A comment is required to query or reject.");
      return;
    }
    start(async () => {
      const result = await decideClaim({ claimId: active.id, decision, comment: comment || undefined });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${decision} recorded`);
      const remaining = items.filter((item) => item.id !== active.id);
      setActiveId(remaining[0]?.id ?? null);
      setComment("");
      router.refresh();
    });
  }

  const selectedHardFail = items
    .filter((item) => selected.includes(item.id))
    .some((item) => item.edgeChecks.some((check) => !check.passed && check.check !== "exif_gps_match"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
      <div className="border-r border-line">
        {[...grouped.entries()].map(([site, list]) => (
          <div key={site} className="border-b border-line-soft">
            <p className="bg-forest-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {site} · {list.length}
            </p>
            {list.map((item) => {
              const submittedAt = new Date(item.submittedAt);
              const ageH = (Date.now() - submittedAt.getTime()) / 36e5;
              return (
                <div key={item.id} className="flex items-center gap-2 px-2">
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={(on) =>
                      setSelected((cur) => (on ? [...cur, item.id] : cur.filter((id) => id !== item.id)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`flex min-h-14 flex-1 items-center justify-between px-2 py-2 text-left text-sm ${active?.id === item.id ? "bg-forest-50" : ""}`}
                  >
                    <span>
                      <span className="block font-medium">{item.entity.legalName}</span>
                      <span className="block text-xs text-ink-400">
                        {item.contractLine.itemName} · {item.quantity} {item.contractLine.unit}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${ageH > 48 ? "bg-clay-500" : ageH > 24 ? "bg-gold-500" : "bg-line"}`} />
                      <span className="text-xs text-ink-400">{formatRelative(submittedAt)}</span>
                      <span className="flex gap-0.5">
                        {item.edgeChecks.map((check) => (
                          <span
                            key={check.id}
                            className={`h-1.5 w-1.5 rounded-full ${check.passed ? "bg-forest-900" : "bg-clay-500"}`}
                          />
                        ))}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <div className="p-3">
          <Button
            disabled={selected.length === 0 || selectedHardFail || pending}
            onClick={() => {
              start(async () => {
                const result = await batchApprove({ claimIds: selected });
                if (result.ok) {
                  toast.success(`${result.data.approved} approved`);
                  setSelected([]);
                  router.refresh();
                } else toast.error(result.error);
              });
            }}
          >
            Approve selected
          </Button>
          {selectedHardFail ? (
            <p className="mt-2 text-xs text-clay-500">
              A selected claim failed a hard check. Open it individually.
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {active ? (
          <>
            <h2 className="font-display text-xl font-semibold">{active.entity.legalName}</h2>
            <p className="text-sm text-ink-600">
              {active.contractLine.itemName} · {active.quantity} {active.contractLine.unit}
            </p>
            <div className="mt-4">
              <EvidenceViewer evidence={active.evidence} checks={active.edgeChecks} claimRef={active.ref} />
            </div>
            <Textarea
              className="mt-4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment required for query or reject"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="accent" disabled={pending} onClick={() => decide("APPROVE")}>
                Approve
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => decide("QUERY")}>
                Query
              </Button>
              <Button variant="destructive" disabled={pending} onClick={() => decide("REJECT")}>
                Reject
              </Button>
            </div>
            <p className="mt-4 text-xs text-ink-400">Shortcuts A approve · Q query · R reject · J / K move</p>
          </>
        ) : (
          <p className="text-sm text-ink-600">Select a claim.</p>
        )}
      </div>
    </div>
  );
}
