"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitClaim } from "@/actions/claims";
import { EdgeCheckSequence } from "@/components/kiungo/EdgeCheckSequence";
import { MapView } from "@/components/kiungo/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatKes } from "@/lib/format";
import { haversineMeters, offsetLatLng } from "@/lib/geo";

type Line = {
  id: string;
  itemName: string;
  unit: string;
  unitRate: number;
  quantityTotal: number;
  quantityClaimed: number;
  contractId: string;
  contractRef: string;
  siteName: string;
  siteLat: number;
  siteLng: number;
  geofenceM: number;
  buyer: string;
};

export function ClaimWizard({ lines }: { lines: Line[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(Number(params.get("step") ?? "1") || 1);
  const [contractId, setContractId] = useState(
    lines.find((l) => l.id === params.get("line"))?.contractId ?? lines[0]?.contractId ?? "",
  );
  const [search, setSearch] = useState("");
  const [lineId, setLineId] = useState(params.get("line") ?? "");
  const [qty, setQty] = useState(40);
  const [note, setNote] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [sha, setSha] = useState("");
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [exif, setExif] = useState<{ lat: number; lng: number } | null>(null);
  const [checks, setChecks] = useState(0);
  const [pending, start] = useTransition();

  const contracts = useMemo(() => {
    const map = new Map<string, { id: string; ref: string; site: string; buyer: string }>();
    for (const line of lines) {
      if (!map.has(line.contractId)) {
        map.set(line.contractId, {
          id: line.contractId,
          ref: line.contractRef,
          site: line.siteName,
          buyer: line.buyer,
        });
      }
    }
    const q = search.toLowerCase();
    return [...map.values()].filter(
      (c) => !q || c.ref.toLowerCase().includes(q) || c.site.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q),
    );
  }, [lines, search]);

  const contractLines = lines.filter((l) => l.contractId === contractId);
  const line = lines.find((item) => item.id === lineId) ?? contractLines[0];
  const remaining = line ? line.quantityTotal - line.quantityClaimed : 0;
  const over = Boolean(line && qty > remaining);
  const drift =
    line && lat != null && lng != null
      ? Math.round(haversineMeters({ lat, lng }, { lat: line.siteLat, lng: line.siteLng }))
      : null;

  function go(next: number) {
    setStep(next);
    const searchParams = new URLSearchParams(params.toString());
    searchParams.set("step", String(next));
    if (lineId) searchParams.set("line", lineId);
    router.replace(`/console/claims/new?${searchParams.toString()}`);
  }

  async function onFile(file: File) {
    const buf = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setSha(hex);
    setPhotoUrl(URL.createObjectURL(file));
    setCapturedAt(new Date().toISOString());
  }

  function demoLocation() {
    if (!line) return;
    const pin = offsetLatLng({ lat: line.siteLat, lng: line.siteLng }, 84, 20);
    setLat(pin.lat);
    setLng(pin.lng);
    setExif(pin);
    if (!capturedAt) setCapturedAt(new Date().toISOString());
    if (!sha) setSha(`demo${line.id}${Date.now()}`.padEnd(64, "0"));
  }

  function useGeo() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => demoLocation(),
    );
  }

  const canNext =
    (step === 1 && !!line) ||
    (step === 2 && qty > 0 && !over) ||
    (step === 3 && lat != null && sha) ||
    step === 4;

  if (lines.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-600">
        No active contract lines. Seed the database or switch to Amina Wanjiru.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 h-2 overflow-hidden rounded-pill bg-line-soft">
        <div className="h-full bg-forest-900" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">What did you deliver?</h2>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contract, site or buyer"
          />
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {contracts.map((contract) => (
              <button
                key={contract.id}
                type="button"
                onClick={() => {
                  setContractId(contract.id);
                  const first = lines.find((l) => l.contractId === contract.id);
                  if (first) setLineId(first.id);
                }}
                className={`min-h-11 w-full rounded-lg border p-3 text-left ${contract.id === contractId ? "border-forest-900 bg-forest-50" : "border-line bg-surface"}`}
              >
                <p className="font-mono text-xs">{contract.ref}</p>
                <p className="text-sm">{contract.site} · {contract.buyer}</p>
              </button>
            ))}
          </div>
          {line ? (
            <p className="text-sm font-medium text-ink-900">
              Remaining on selected line: {remaining} {line.unit}
            </p>
          ) : null}
          {contractLines.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLineId(item.id)}
              className={`w-full rounded-lg border p-4 text-left ${item.id === lineId ? "border-forest-900 bg-forest-50" : "border-line bg-surface"}`}
            >
              <p className="font-medium">{item.itemName}</p>
              <p className="text-xs text-ink-400">
                {item.contractRef} · {item.siteName} · {item.buyer}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                Remaining {item.quantityTotal - item.quantityClaimed} {item.unit}
              </p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && line && (
        <div>
          <h2 className="font-display text-lg font-semibold">How much?</h2>
          <div className="mt-4 flex items-center gap-3">
            <Button type="button" variant="outline" className="min-h-11 min-w-11" onClick={() => setQty(Math.max(1, qty - 1))}>
              −
            </Button>
            <Input
              type="number"
              className="text-center font-display text-3xl tabular-nums"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <span className="text-sm text-ink-400">{line.unit}</span>
            <Button type="button" variant="outline" className="min-h-11 min-w-11" onClick={() => setQty(qty + 1)}>
              +
            </Button>
          </div>
          {over ? (
            <p className="mt-3 text-sm text-clay-500">
              That is {qty - remaining} {line.unit} more than the contract balance of {remaining}. Reduce the
              quantity or raise a variation with the buyer.
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-600">Balance remaining: {remaining} {line.unit}</p>
          )}
          <p className="mt-2 text-sm text-ink-400">
            Indicative value before verification · {formatKes(qty * line.unitRate)}
          </p>
        </div>
      )}

      {step === 3 && line && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Evidence</h2>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Selected delivery evidence" className="h-40 w-full rounded-md object-cover" />
          ) : null}
          <p className="font-mono text-xs text-ink-400">
            {sha ? `Hash ${sha.slice(0, 12)}` : "Hash pending"}
            {capturedAt ? ` · captured ${new Date(capturedAt).toLocaleTimeString("en-KE")}` : ""}
            {exif ? ` · EXIF ${exif.lat.toFixed(4)}, ${exif.lng.toFixed(4)}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={useGeo}>
              Use my current location
            </Button>
            <Button type="button" variant="outline" onClick={demoLocation}>
              Use demo location
            </Button>
          </div>
          <MapView
            height={180}
            onPick={(pickLat, pickLng) => {
              setLat(pickLat);
              setLng(pickLng);
            }}
            points={[
              { lat: line.siteLat, lng: line.siteLng, label: line.siteName },
              ...(lat != null && lng != null ? [{ lat, lng, label: "You" }] : []),
            ]}
            connect={lat != null}
            driftLabel={drift != null ? `${drift} m drift` : undefined}
          />
          {drift != null ? (
            <p className={drift <= line.geofenceM ? "text-sm text-lime-700" : "text-sm text-gold-500"}>
              {line.siteName} · {drift} m from site centre {drift <= line.geofenceM ? "✓" : ""}
            </p>
          ) : null}
        </div>
      )}

      {step === 4 && line && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Confirm</h2>
          {checks > 0 ? (
            <EdgeCheckSequence resolved={checks} />
          ) : (
            <>
              <p>{line.itemName}</p>
              <p className="tabular-nums">
                {qty} {line.unit} · {formatKes(qty * line.unitRate)}
              </p>
              <p className="text-sm text-ink-600">{line.siteName}</p>
              <Textarea maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
              <Button
                variant="accent"
                className="w-full"
                disabled={pending || !canNext}
                onClick={() => {
                  if (lat == null || lng == null || !line) return;
                  start(async () => {
                    let i = 0;
                    await new Promise<void>((resolve) => {
                      const t = window.setInterval(() => {
                        i += 1;
                        setChecks(i);
                        if (i >= 4) {
                          window.clearInterval(t);
                          resolve();
                        }
                      }, 450);
                    });
                    const result = await submitClaim({
                      contractLineId: line.id,
                      quantity: qty,
                      lat,
                      lng,
                      note: note || undefined,
                      channel: "WEB",
                      evidence: [
                        {
                          url: photoUrl.startsWith("blob:") ? "/mock/delivery-01.jpg" : photoUrl || "/mock/delivery-01.jpg",
                          sha256: sha,
                          exifLat: exif?.lat ?? lat,
                          exifLng: exif?.lng ?? lng,
                          capturedAt: capturedAt ?? new Date().toISOString(),
                          deviceHint: "Chrome Mobile",
                        },
                      ],
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      setChecks(0);
                      return;
                    }
                    toast.success(`${result.data.ref} submitted`);
                    router.push(`/console/claims/${result.data.id}`);
                  });
                }}
              >
                Submit delivery claim
              </Button>
            </>
          )}
        </div>
      )}

      {step < 4 && checks === 0 ? (
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 1} onClick={() => go(step - 1)}>
            Back
          </Button>
          <Button type="button" disabled={!canNext} onClick={() => go(step + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
