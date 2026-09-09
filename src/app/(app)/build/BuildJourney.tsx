"use client";

import { useState } from "react";
import { toast } from "sonner";
import { inviteToQuote } from "@/actions/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUNTIES, COPY, countyName } from "@/lib/constants";
import { formatKes } from "@/lib/format";

const STAGES = [
  "Land and approvals",
  "Design",
  "Foundation",
  "Structure",
  "Roof",
  "Openings",
  "MEP",
  "Finishes",
  "Finance",
] as const;

const SQM: Record<number, number> = { 1: 42, 2: 68, 3: 90, 4: 118, 5: 140 };
const RATE = { basic: 34000, standard: 44000, premium: 58000 } as const;

export function BuildJourney({
  entities,
  mortgages,
}: {
  entities: { id: string; slug: string; legalName: string; category: string; countyCode: string }[];
  mortgages: { id: string; name: string; provider: string }[];
}) {
  const [step, setStep] = useState(1);
  const [county, setCounty] = useState("047");
  const [ward, setWard] = useState("Embakasi South");
  const [beds, setBeds] = useState(3);
  const [storeys, setStoreys] = useState(1);
  const [plot, setPlot] = useState(50);
  const [finish, setFinish] = useState<"basic" | "standard" | "premium">("standard");

  const m2 = (SQM[beds] ?? 90) + (storeys - 1) * 18;
  const rate = RATE[finish];
  const low = Math.round(m2 * rate * 0.86);
  const high = Math.round(m2 * rate * 1.16);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="h-2 overflow-hidden rounded-pill bg-line-soft">
        <div className="h-full bg-forest-900" style={{ width: `${(step / 5) * 100}%` }} />
      </div>
      {step === 1 && (
        <div>
          <h2 className="font-display text-lg font-semibold">Location</h2>
          <label className="mt-3 block text-sm text-ink-600">
            County
            <select
              className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-ink-900"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              {COUNTIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm text-ink-600">
            Ward
            <Input className="mt-1" value={ward} onChange={(e) => setWard(e.target.value)} />
          </label>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="font-display text-lg font-semibold">The house</h2>
          <label className="mt-3 block text-sm">
            Bedrooms
            <Input type="number" min={1} max={5} value={beds} onChange={(e) => setBeds(Number(e.target.value))} />
          </label>
          <label className="mt-3 block text-sm">
            Storeys
            <Input type="number" min={1} max={3} value={storeys} onChange={(e) => setStoreys(Number(e.target.value))} />
          </label>
          <label className="mt-3 block text-sm">
            Plot size (× 50 m²)
            <Input type="number" min={1} value={plot} onChange={(e) => setPlot(Number(e.target.value))} />
          </label>
          <p className="mt-1 text-xs text-ink-400">{plot * 50} m² plot</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["basic", "standard", "premium"] as const).map((f) => (
              <Button key={f} type="button" variant={finish === f ? "default" : "outline"} onClick={() => setFinish(f)}>
                {f}
              </Button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="font-display text-lg font-semibold">Budget</h2>
          <p className="mt-3 text-sm text-ink-600">
            A {beds}-bedroom {finish} house in {countyName(county)} ({ward}) is planned as a band, never a point estimate.
          </p>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="font-display text-lg font-semibold">Estimate</h2>
          <p className="mt-4 font-display text-3xl font-bold tabular-nums">
            {formatKes(low)} – {formatKes(high)}
          </p>
          <p className="mt-3 text-sm text-ink-600">
            {COPY.disclaimers.buildEstimate.replace("{county}", countyName(county))}
          </p>
          <p className="mt-2 text-xs text-ink-400">
            Assumes {m2} m², {storeys} storey, {finish} finish, plot already secured.
          </p>
        </div>
      )}
      {step === 5 && (
        <div>
          <h2 className="font-display text-lg font-semibold">Your path</h2>
          <ol className="mt-4 space-y-4">
            {STAGES.map((stage, i) => (
              <li key={stage} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-medium">
                  {i + 1}. {stage}
                </p>
                {stage === "Finance"
                  ? mortgages.map((m) => (
                      <p key={m.id} className="mt-1 text-sm text-ink-600">
                        {m.provider} · {m.name}
                      </p>
                    ))
                  : entities.slice(i * 3, i * 3 + 3).map((e) => (
                      <p key={e.id} className="mt-1 text-sm text-ink-600">
                        {e.legalName}
                      </p>
                    ))}
                <Button
                  className="mt-2 min-h-11"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const match = entities[i * 3];
                    if (!match) {
                      toast.success("Interest recorded");
                      return;
                    }
                    const result = await inviteToQuote({
                      entityId: match.id,
                      message: `Quote request from a citizen build in ${countyName(county)}`,
                    });
                    if (result.ok) toast.success("Invite sent");
                  }}
                >
                  Invite to quote
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex justify-between">
        <Button variant="ghost" className="min-h-11" disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        {step < 5 ? (
          <Button className="min-h-11" onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : null}
      </div>
    </div>
  );
}
