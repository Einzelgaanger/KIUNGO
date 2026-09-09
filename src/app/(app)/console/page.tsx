import type { Metadata } from "next";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import { ClaimCard, ClaimRow } from "@/components/kiungo/ClaimRow";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatCard } from "@/components/kiungo/StatCard";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { VerificationBadge } from "@/components/kiungo/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db";
import { formatKesCompact } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Console" };

export default async function ConsolePage() {
  const session = await getSession();
  const entityId = session.entityId;
  if (!entityId) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <SectionHeading title={`Good morning, ${session.name.split(" ")[0]}`} />
        <p className="mt-4 text-sm text-ink-600">This persona has no supplier entity.</p>
      </div>
    );
  }

  const now = new Date("2026-09-09T12:00:00.000Z");
  const monthStart = new Date("2026-09-01T00:00:00.000Z");
  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
    include: { certifications: true },
  });
  const [claims, lines, queried, monthClaims, monthValue] = await Promise.all([
    prisma.claim.findMany({
      where: { entityId },
      include: { contractLine: true, site: true, valueOutcome: true },
      orderBy: { submittedAt: "desc" },
      take: 8,
    }),
    prisma.contractLine.findMany({
      where: { contract: { supplierId: entityId, status: "ACTIVE" } },
      include: { contract: { include: { site: true } } },
    }),
    prisma.claim.count({ where: { entityId, status: "QUERIED" } }),
    prisma.claim.count({ where: { entityId, submittedAt: { gte: monthStart } } }),
    prisma.valueOutcome.aggregate({
      where: { claim: { entityId }, computedAt: { gte: monthStart } },
      _sum: { supplierShare: true },
    }),
  ]);

  const expiring = (entity?.certifications ?? []).filter((cert) => {
    if (!cert.expiresAt) return false;
    const days = differenceInDays(cert.expiresAt, now);
    return days >= 0 && days <= 60;
  }).length;
  const lowLines = lines.filter((line) => {
    const pct = line.quantityTotal === 0 ? 0 : line.quantityClaimed / line.quantityTotal;
    const days = differenceInDays(line.contract.expiresAt, now);
    return pct < 0.2 && days < 30;
  }).length;

  const firstName = session.name.split(" ")[0] ?? session.name;
  const hour = 9;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            eyebrow="Deliver"
            title={`${greeting}, ${firstName}`}
            description={entity?.legalName ?? session.entityName ?? ""}
          />
          {entity ? <VerificationBadge status={entity.verification} certification={entity.certifications[0]} /> : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {queried > 0 ? (
            <Link href="/console/claims?status=QUERIED" className="rounded-lg border border-gold-500/40 bg-gold-100 p-4">
              <p className="font-medium text-ink-900">{queried} claims queried — respond</p>
            </Link>
          ) : null}
          {expiring > 0 ? (
            <Link href="/console/profile" className="rounded-lg border border-gold-500/40 bg-gold-100 p-4">
              <p className="font-medium text-ink-900">{expiring} certifications expiring in 60 days</p>
            </Link>
          ) : null}
          {lowLines > 0 ? (
            <Link href="/console/contracts" className="rounded-lg border border-gold-500/40 bg-gold-100 p-4">
              <p className="font-medium text-ink-900">
                {lowLines} contract lines under 20% claimed with under 30 days to expiry
              </p>
            </Link>
          ) : null}
          {queried === 0 && expiring === 0 && lowLines === 0 ? (
            <div className="rounded-lg bg-lime-100 p-4 text-forest-900 md:col-span-3">
              Nothing needs your attention. {claims.filter((c) => c.status === "QUEUED").length} claims are with the reviewer.
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Claims this month" value={monthClaims} />
          <StatCard
            label="Value settled this month"
            value={formatKesCompact(monthValue._sum.supplierShare ?? 0)}
          />
          <StatCard label="Median approval time" value="3h" hint="Across your last 20 claims" />
          <StatCard label="Reliability score" value={entity?.reliability ?? "—"} />
        </div>

        <Button asChild variant="accent" size="xl" className="mt-6 w-full">
          <Link href="/console/claims/new">Submit a delivery</Link>
        </Button>

        <div className="mt-10">
          <SectionHeading as="h2" title="Active contracts" />
          <div className="mt-4 space-y-3">
            {lines.slice(0, 8).map((line) => {
              const pct = line.quantityTotal === 0 ? 0 : (line.quantityClaimed / line.quantityTotal) * 100;
              return (
                <div key={line.id} className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{line.itemName}</p>
                      <p className="text-xs text-ink-400">
                        {line.contract.ref} · {line.contract.site.name}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/console/claims/new?line=${line.id}`}>Claim against this</Link>
                    </Button>
                  </div>
                  <Progress value={Math.min(100, pct)} className="mt-3" />
                  <p className="mt-1 text-xs tabular-nums text-ink-400">
                    {line.quantityClaimed} / {line.quantityTotal} {line.unit} · expires {line.contract.expiresAt.toISOString().slice(0, 10)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <SectionHeading as="h2" title="Recent claims" action={<StatusBadge status="QUEUED" size="sm" />} />
          <div className="mt-4 hidden rounded-lg border border-line md:block">
            {claims.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} href={`/console/claims/${claim.id}`} showValue />
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:hidden">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} href={`/console/claims/${claim.id}`} showValue />
            ))}
          </div>
        </div>

        {entity?.reliability != null && entity.reliability >= 65 ? (
          <Link href="/finance" className="mt-8 block rounded-lg bg-lime-100 p-5 text-forest-900">
            Your delivery history qualifies you for 3 financing offers.
          </Link>
        ) : null}
      </div>
    </PageFade>
  );
}
