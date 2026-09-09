import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EvidenceViewer } from "@/components/kiungo/EvidenceViewer";
import { MapView } from "@/components/kiungo/MapView";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { QueryResponse } from "@/app/(app)/console/claims/[id]/QueryResponse";
import { CopyButton } from "@/components/kiungo/CopyButton";
import { Card, CardContent } from "@/components/ui/card";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";
import { formatDatePair, formatHashPrefix, formatKes, formatQuantity } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Claim detail" };

const STEPS = ["Submitted", "Edge checked", "Queued", "Reviewed", "Value computed", "Settled"] as const;

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const claim = await withDb(
    () =>
      prisma.claim.findUnique({
        where: { id },
        include: {
          contractLine: true,
          contract: { include: { buyer: true } },
          site: true,
          evidence: true,
          edgeChecks: true,
          reviews: { include: { reviewer: true } },
          valueOutcome: { include: { settlement: true } },
          entity: true,
        },
      }),
    null,
  );
  if (!claim) notFound();
  const party = session.entityId === claim.entityId || session.entityId === claim.contract.buyerId || session.role === "REVIEWER" || session.role === "PROGRAMME";

  const current =
    claim.status === "SETTLED"
      ? 5
      : claim.status === "APPROVED"
        ? 4
        : claim.reviews.length > 0
          ? 3
          : claim.status === "QUEUED"
            ? 2
            : 1;

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading eyebrow="Claim" title={claim.ref} />
          <StatusBadge status={claim.status} />
          <span className="rounded-pill bg-line-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase">
            {claim.channel}
          </span>
          <p className="text-xs text-ink-400">{formatDatePair(claim.submittedAt)}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <Card>
              <CardContent className="p-5 space-y-1 text-sm">
                <p className="font-medium">{claim.contractLine.itemName}</p>
                <p className="tabular-nums">{formatQuantity(claim.quantity, claim.contractLine.unit)}</p>
                <p>Contract {claim.contract.ref} · {claim.site.name}</p>
                <p>Buyer {claim.contract.buyer.legalName}</p>
                {party ? (
                  <p>
                    Indicative {formatKes(claim.quantity * claim.contractLine.unitRate)}
                    {claim.valueOutcome ? ` · Final ${formatKes(claim.valueOutcome.grossAmount)}` : ""}
                  </p>
                ) : (
                  <p className="text-ink-400">{COPY.disclaimers.entityValues}</p>
                )}
              </CardContent>
            </Card>

            <EvidenceViewer evidence={claim.evidence} checks={claim.edgeChecks} claimRef={claim.ref} />

            <div>
              <h2 className="font-display text-lg font-semibold">Edge checks</h2>
              <ul className="mt-3 space-y-2">
                {claim.edgeChecks.map((check) => (
                  <li key={check.id} className="rounded-md border border-line bg-surface p-3 text-sm">
                    <StatusBadge status={check.passed ? "APPROVED" : "REJECTED"} size="sm" />
                    <span className="ml-2 font-medium">{check.check.replaceAll("_", " ")}</span>
                    <p className="mt-1 text-ink-600">{check.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">Timeline</h2>
              <ol className="mt-3 space-y-2">
                {STEPS.map((label, i) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${i < current ? "bg-lime-500" : i === current ? "bg-gold-500" : "bg-line"}`} />
                    {label}
                  </li>
                ))}
              </ol>
            </div>

            {party && claim.valueOutcome ? (
              <Card>
                <CardContent className="space-y-2 p-5 font-mono text-sm tabular-nums">
                  <p>Base {formatKes(claim.valueOutcome.baseAmount)}</p>
                  <p>Quality multiplier {claim.valueOutcome.qualityMultiplier.toFixed(2)}</p>
                  <p>Gross {formatKes(claim.valueOutcome.grossAmount)}</p>
                  <p>Supplier 80% {formatKes(claim.valueOutcome.supplierShare)}</p>
                  <p>Platform 10% {formatKes(claim.valueOutcome.platformShare)}</p>
                  <p>Welfare 10% {formatKes(claim.valueOutcome.welfareShare)}</p>
                  {claim.valueOutcome.settlement ? (
                    <p>
                      {claim.valueOutcome.settlement.instrument} · {claim.valueOutcome.settlement.reference}
                    </p>
                  ) : null}
                  <p className="flex items-center justify-between gap-2">
                    <span>Proof {formatHashPrefix(claim.valueOutcome.proofSetHash, 16)}</span>
                    <CopyButton value={claim.valueOutcome.proofSetHash} />
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {claim.status === "QUERIED" ? <QueryResponse claimId={claim.id} /> : null}
          </div>

          <aside className="space-y-4">
            <MapView
              height={240}
              connect
              driftLabel={claim.driftMeters != null ? `${claim.driftMeters} m drift` : undefined}
              points={[
                { lat: claim.site.lat, lng: claim.site.lng, label: claim.site.name },
                { lat: claim.submittedLat, lng: claim.submittedLng, label: "Submission" },
              ]}
            />
            {claim.reviews[0] ? (
              <p className="text-sm text-ink-600">
                {claim.reviews[0].reviewer.name}: {claim.reviews[0].comment ?? "No comment"}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </PageFade>
  );
}

