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
import { DEMO_NOW_ISO } from "@/lib/constants";
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
  const [siteFilter, setSiteFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [checkFilter, setCheckFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const filtered = useMemo(() => {
    const now = new Date(DEMO_NOW_ISO).getTime();
    return items.filter((item) => {
      if (siteFilter !== "all" && item.site.id !== siteFilter) return false;
      const ageH = (now - new Date(item.submittedAt).getTime()) / 36e5;
      if (ageFilter === "24" && ageH <= 24) return false;
      if (ageFilter === "48" && ageH <= 48) return false;
      const allPass = item.edgeChecks.length > 0 && item.edgeChecks.every((c) => c.passed);
      if (checkFilter === "pass" && !allPass) return false;
      if (checkFilter === "fail" && allPass) return false;
      if (verifyFilter !== "all" && item.entity.verification !== verifyFilter) return false;
      return true;
    });
  }, [items, siteFilter, ageFilter, checkFilter, verifyFilter]);
  const sites = useMemo(() => Array.from(new Map(items.map((i) => [i.site.id, i.site])).values()), [items]);
  const [activeId, setActiveId] = useState(filtered[0]?.id ?? items[0]?.id ?? null);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const active = filtered.find((item) => item.id === activeId) ?? filtered[0];

  const grouped = useMemo(() => {
    const map = new Map<string, QueueItem[]>();
    for (const item of filtered) {
      const list = map.get(item.site.name) ?? [];
      list.push(item);
      map.set(item.site.name, list);
    }
    return map;
  }, [filtered]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      const idx = filtered.findIndex((item) => item.id === active.id);
      if (e.key === "j" || e.key === "J") setActiveId(filtered[Math.min(filtered.length - 1, idx + 1)]?.id ?? active.id);
      if (e.key === "k" || e.key === "K") setActiveId(filtered[Math.max(0, idx - 1)]?.id ?? active.id);
      if (e.key === "a" || e.key === "A") decide("APPROVE");
      if (e.key === "q" || e.key === "Q") decide("QUERY");
      if (e.key === "r" || e.key === "R") decide("REJECT");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, comment, filtered]);

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
      const remaining = filtered.filter((item) => item.id !== active.id);
      setActiveId(remaining[0]?.id ?? null);
      setComment("");
      router.refresh();
    });
  }

  const selectedHardFail = items
    .filter((item) => selected.includes(item.id))
    .some((item) => item.edgeChecks.some((check) => !check.passed && check.check !== "exif_gps_match"));

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-line p-3">
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} aria-label="Site">
          <option value="all">All sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} aria-label="Age">
          <option value="all">Any age</option>
          <option value="24">Older than 24h</option>
          <option value="48">Older than 48h</option>
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={checkFilter} onChange={(e) => setCheckFilter(e.target.value)} aria-label="Edge checks">
          <option value="all">Any edge-check outcome</option>
          <option value="pass">All passed</option>
          <option value="fail">Any failed</option>
        </select>
        <select className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm" value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)} aria-label="Verification">
          <option value="all">Any verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
      <div className="border-r border-line">
        {[...grouped.entries()].map(([site, list]) => (
          <div key={site} className="border-b border-line-soft">
            <p className="bg-forest-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {site} · {list.length}
            </p>
            {list.map((item) => {
              const submittedAt = new Date(item.submittedAt);
              const ageH = (new Date(DEMO_NOW_ISO).getTime() - submittedAt.getTime()) / 36e5;
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
              <EvidenceViewer
                evidence={active.evidence}
                checks={active.edgeChecks}
                claimRef={active.ref}
                deviceLat={active.submittedLat}
                deviceLng={active.submittedLng}
                driftMeters={active.driftMeters}
              />
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
              <Button variant="warning" disabled={pending} onClick={() => decide("QUERY")}>
                Query
              </Button>
              <Button variant="dangerOutline" disabled={pending} onClick={() => decide("REJECT")}>
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
    </div>
  );
}
