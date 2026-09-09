import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { ReliabilityScore } from "@/components/kiungo/ReliabilityScore";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { FinanceApply } from "@/app/(app)/finance/FinanceApply";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";
import { startOfIsoWeek } from "@/lib/scoring";
import { DEMO_NOW_ISO } from "@/lib/constants";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const session = await getSession();
  if (session.role === "FINANCIER") {
    const counterparties = await withDb(
      () =>
        prisma.entity.findMany({
          where: { verification: "VERIFIED", reliability: { not: null } },
          include: { _count: { select: { claims: true } }, financeApps: true },
          take: 24,
          orderBy: { reliability: "desc" },
        }),
      [],
    );
    const apps = await withDb(
      () =>
        prisma.financeApplication.findMany({
          include: { entity: true, product: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      [],
    );
    const since = new Date("2026-06-17T00:00:00.000Z");
    const recent = await withDb(
      () =>
        prisma.claim.findMany({
          where: { entityId: { in: counterparties.map((c) => c.id) }, submittedAt: { gte: since } },
          select: { entityId: true, submittedAt: true },
        }),
      [],
    );
    const weekKeys: string[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(DEMO_NOW_ISO);
      d.setUTCDate(d.getUTCDate() - i * 7);
      weekKeys.push(startOfIsoWeek(d));
    }
    return (
      <PageFade>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
          <SectionHeading eyebrow="Grow" title="Verified counterparties" />
          <div className="mt-6 space-y-3">
            {counterparties.map((entity) => (
              <div key={entity.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{entity.legalName}</p>
                  <ReliabilityScore score={entity.reliability} />
                </div>
                <Sparkline
                  values={weekKeys.map(
                    (week) =>
                      recent.filter(
                        (c) => c.entityId === entity.id && startOfIsoWeek(c.submittedAt) === week,
                      ).length,
                  )}
                />
                <p className="text-xs text-ink-400">{entity._count.claims} deliveries · {entity.financeApps.length} applications</p>
              </div>
            ))}
          </div>
          <h2 className="mt-10 font-display text-lg font-semibold">Applications to triage</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {apps.map((app) => (
              <li key={app.id} className="rounded-md border border-line p-3">
                {app.entity.legalName} · {app.product.productName} · {formatKes(app.amount)} · {app.status}
              </li>
            ))}
          </ul>
        </div>
      </PageFade>
    );
  }

  const entityId = session.entityId;
  const entity = entityId
    ? await withDb(
        () =>
          prisma.entity.findUnique({
            where: { id: entityId },
            include: { claims: { include: { valueOutcome: true } }, financeApps: { include: { product: true } } },
          }),
        null,
      )
    : null;
  const products = await withDb(() => prisma.financeProduct.findMany(), []);
  const completed = entity?.claims.filter((c) => c.status === "SETTLED" || c.status === "APPROVED").length ?? 0;
  const settledValue =
    entity?.claims
      .filter((c) => c.status === "SETTLED")
      .reduce((s, c) => s + (c.valueOutcome?.supplierShare ?? 0), 0) ?? 0;
  const available = products.filter((p) => {
    if (!entity) return false;
    if (p.requiresVerified && entity.verification !== "VERIFIED") return false;
    return (entity.reliability ?? 0) >= p.minReliability;
  });
  const blocked = products.filter((p) => !available.includes(p));

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Grow" title="Matched finance" />
        {entity ? (
          <div className="mt-6 rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <ReliabilityScore score={entity.reliability} size="lg" />
              <StatusBadge status={entity.verification} />
            </div>
            <p className="mt-3 text-sm text-ink-600">
              Based on {completed} verified deliveries worth {formatKes(settledValue)} over 6 months, {available.length} of {products.length} products are available to you.
            </p>
          </div>
        ) : null}

        {available.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title={COPY.empty.financeNone.title}
            description={COPY.empty.financeNone.description}
          />
        ) : (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">Available to you</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {available.map((product) => (
                <FinanceApply key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold">Not yet available</h2>
          <div className="mt-3 grid gap-4 opacity-60 md:grid-cols-2">
            {blocked.map((product) => (
              <div key={product.id} className="rounded-lg border border-line bg-surface p-5">
                <p className="font-medium">{product.productName}</p>
                <p className="text-sm text-ink-600">{product.providerName}</p>
                <p className="mt-2 text-sm">
                  Requires reliability {product.minReliability}. You are at {entity?.reliability ?? 0}.
                  {product.minReliability > (entity?.reliability ?? 0)
                    ? " Six more on-time deliveries would typically close that gap."
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {entity && entity.financeApps.length > 0 ? (
          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold">Your applications</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {entity.financeApps.map((app) => (
                <li key={app.id} className="rounded-md border border-line p-3">
                  {app.product.productName} · {formatKes(app.amount)} · {app.status}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </PageFade>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const width = 60;
  const height = 20;
  const points = values
    .map((v, i) => {
      const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * width;
      const y = height - 1 - (v / max) * (height - 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="mt-2 text-forest-900" aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
