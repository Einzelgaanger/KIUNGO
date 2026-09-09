"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitClaim } from "@/actions/claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatKes } from "@/lib/format";
import { offsetLatLng } from "@/lib/geo";

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
  const step = Number(params.get("step") ?? "1");
  const [lineId, setLineId] = useState(params.get("line") ?? lines[0]?.id ?? "");
  const [qty, setQty] = useState(40);
  const [note, setNote] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("/mock/delivery-01.jpg");
  const [sha, setSha] = useState("");
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [exif, setExif] = useState<{ lat: number; lng: number } | null>(null);
  const [pending, start] = useTransition();

  const line = useMemo(() => lines.find((item) => item.id === lineId) ?? lines[0], [lineId, lines]);
  const remaining = line ? line.quantityTotal - line.quantityClaimed : 0;
  const over = line && qty > remaining;
  const drift =
    line && lat != null && lng != null
      ? Math.round(
          Math.hypot((lat - line.siteLat) * 111320, (lng - line.siteLng) * 111320 * Math.cos((line.siteLat * Math.PI) / 180)),
        )
      : null;

  function go(next: number) {
    const search = new URLSearchParams(params.toString());
    search.set("step", String(next));
    if (lineId) search.set("line", lineId);
    router.push(`/console/claims/new?${search.toString()}`);
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

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 h-2 overflow-hidden rounded-pill bg-line-soft">
        <div className="h-full bg-forest-900" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">What did you deliver?</h2>
          {lines.map((item) => (
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
            <Button type="button" variant="outline" onClick={() => setQty(Math.max(1, qty - 1))}>
              −
            </Button>
            <Input
              type="number"
              className="text-center font-display text-3xl tabular-nums"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <span className="text-sm text-ink-400">{line.unit}</span>
            <Button type="button" variant="outline" onClick={() => setQty(qty + 1)}>
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
          <p className="font-mono text-xs text-ink-400">{sha ? sha.slice(0, 12) : "Hash pending"}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={useGeo}>
              Use my current location
            </Button>
            <Button type="button" variant="outline" onClick={demoLocation}>
              Use demo location
            </Button>
          </div>
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
                const result = await submitClaim({
                  contractLineId: line.id,
                  quantity: qty,
                  lat,
                  lng,
                  note: note || undefined,
                  channel: "WEB",
                  evidence: [
                    {
                      url: photoUrl.startsWith("blob:") ? "/mock/delivery-01.jpg" : photoUrl,
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
                  return;
                }
                toast.success(`${result.data.ref} submitted`);
                router.push(`/console/claims/${result.data.id}`);
              });
            }}
          >
            Submit delivery claim
          </Button>
        </div>
      )}

      {step < 4 ? (
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
