import type { Metadata } from "next";
import Link from "next/link";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatCard } from "@/components/kiungo/StatCard";
import { MapView } from "@/components/kiungo/MapView";
import { DeliveriesChart } from "@/components/charts/DeliveriesChart";
import { ValueChart } from "@/components/charts/ValueChart";
import { CompositionCharts } from "@/components/charts/CompositionCharts";
import { IntelligenceControls } from "@/app/(app)/intelligence/IntelligenceControls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { COUNTY_BY_CODE, DEMO_NOW_ISO, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { formatKes, formatNumber, formatPercent } from "@/lib/format";
import { parseStringArray } from "@/lib/json";
import { withDb } from "@/lib/safe-db";
import { startOfIsoWeek } from "@/lib/scoring";

export const metadata: Metadata = { title: "Intelligence" };

export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ weeks?: string; county?: string; site?: string }>;
}) {
  const params = await searchParams;
  const weekCount = params.weeks === "4" ? 4 : params.weeks === "8" ? 8 : params.weeks === "all" ? 52 : 16;
  const county = params.county ?? "all";
  const site = params.site ?? "all";
  const now = new Date(DEMO_NOW_ISO);
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - weekCount * 7);

  const empty = {
    claims: [] as Awaited<ReturnType<typeof loadClaims>>,
    entities: [] as { id: string; category: string; ownershipTags: string }[],
    sites: [] as { id: string; unitsComplete: number; countyCode: string; slug: string; name: string }[],
    valueSettled: 0,
    queuedOld: [] as { id: string; entity: { legalName: string }; site: { name: string } }[],
    expiring: [] as { id: string; authority: string; entity: { legalName: string; slug: string } }[],
    hotLines: [] as {
      id: string;
      itemName: string;
      quantityClaimed: number;
      quantityTotal: number;
      contract: { siteId: string; site: { name: string } };
    }[],
  };

  const data = await withDb(async () => {
    const [claims, entities, sites, settled, queuedOld, expiring, hotLines] = await Promise.all([
      loadClaims(since, county, site),
      prisma.entity.findMany({ select: { id: true, category: true, ownershipTags: true } }),
      prisma.site.findMany({ select: { id: true, unitsComplete: true, countyCode: true, slug: true, name: true } }),
      prisma.valueOutcome.aggregate({
        _sum: { supplierShare: true },
        where: { computedAt: { gte: since } },
      }),
      prisma.claim.findMany({
        where: { status: "QUEUED", submittedAt: { lte: new Date("2026-09-07T12:00:00.000Z") } },
        include: { entity: true, site: true },
        take: 8,
      }),
      prisma.certification.findMany({
        where: { expiresAt: { lte: new Date("2026-11-08"), gte: new Date("2026-09-09") } },
        include: { entity: true },
        take: 8,
      }),
      prisma.contractLine.findMany({
        include: { contract: { include: { site: true } } },
        take: 80,
      }),
    ]);
    return {
      claims,
      entities,
      sites,
      valueSettled: settled._sum.supplierShare ?? 0,
      queuedOld,
      expiring,
      hotLines,
    };
  }, empty);

  const { claims, entities, sites, valueSettled, queuedOld, expiring, hotLines } = data;

  const weeks = new Map<string, { SETTLED: number; APPROVED: number; QUEUED: number; OTHER: number; value: number }>();
  const span = Math.min(weekCount, 16);
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(DEMO_NOW_ISO);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.set(startOfIsoWeek(d), { SETTLED: 0, APPROVED: 0, QUEUED: 0, OTHER: 0, value: 0 });
  }
  for (const claim of claims) {
    const key = startOfIsoWeek(new Date(claim.submittedAt));
    const bucket = weeks.get(key);
    if (!bucket) continue;
    if (claim.status === "SETTLED") bucket.SETTLED += 1;
    else if (claim.status === "APPROVED") bucket.APPROVED += 1;
    else if (claim.status === "QUEUED") bucket.QUEUED += 1;
    else bucket.OTHER += 1;
    bucket.value += claim.valueShare;
  }
  const weekRows = [...weeks.entries()].map(([week, row]) => ({ week: week.slice(5), ...row }));
  const withMa = weekRows.map((row, i, arr) => {
    const slice = arr.slice(Math.max(0, i - 3), i + 1);
    const ma = slice.reduce((s, r) => s + r.value, 0) / slice.length;
    return { ...row, ma };
  });

  const approvalHours = claims
    .map((c) => c.approvalHours)
    .filter((h): h is number => h !== null)
    .sort((a, b) => a - b);
  const medianHours = approvalHours.length
    ? approvalHours[Math.floor(approvalHours.length / 2)] ?? 0
    : 0;

  const countyRows = SEEDED_COUNTY_CODES.map((code) => {
    const subset = claims.filter((c) => c.countyCode === code);
    const rejected = subset.filter((c) => c.status === "REJECTED").length;
    const hours = subset.map((c) => c.approvalHours).filter((h): h is number => h !== null);
    const median = hours.length ? hours.sort((a, b) => a - b)[Math.floor(hours.length / 2)] ?? 0 : 0;
    return {
      code,
      name: countyName(code),
      suppliers: new Set(subset.map((c) => c.entityId)).size,
      claims: subset.length,
      value: subset.reduce((s, c) => s + c.valueShare, 0),
      rejection: subset.length ? rejected / subset.length : 0,
      median,
    };
  });

  const hotSites = countyRows.filter((row) => row.rejection > 0.1);

  const byCat = Object.entries(
    entities.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const byOwn = ["YOUTH", "WOMEN", "PWD", "JUA_KALI"].map((tag) => ({
    name: tag,
    value: entities.filter((e) => parseStringArray(e.ownershipTags).includes(tag)).length,
  }));
  const topItems = Object.entries(
    claims.reduce<Record<string, number>>((acc, c) => {
      acc[c.itemName] = (acc[c.itemName] ?? 0) + c.quantity;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const overclaimed = hotLines
    .filter((l) => l.quantityTotal > 0 && l.quantityClaimed / l.quantityTotal > 0.9)
    .slice(0, 6);
  const units = sites.reduce((s, siteRow) => s + siteRow.unitsComplete, 0);
  const first = weekRows[0]?.SETTLED ?? 0;
  const last = weekRows[weekRows.length - 1]?.SETTLED ?? 0;

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Grow" title="Programme dashboard" description="Live, evidenced, by county." />
        <IntelligenceControls weeks={params.weeks ?? "16"} county={county} site={site} />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard tone="dark" label="Evidenced deliveries (16w)" value={claims.length} />
          <StatCard tone="dark" label="Value settled" value={formatKes(valueSettled)} />
          <StatCard tone="dark" label="Active suppliers" value={new Set(claims.map((c) => c.entityId)).size} />
          <StatCard tone="dark" label="Median approval time" value={`${medianHours.toFixed(1)}h`} />
          <StatCard
            tone="dark"
            label="Edge-check rejection rate"
            value={formatPercent((claims.filter((c) => c.status === "REJECTED").length / Math.max(1, claims.length)) * 100, 1)}
          />
          <StatCard tone="dark" label="Units under construction" value={formatNumber(units)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DeliveriesChart data={weekRows} caption={`Weekly deliveries have grown from ${first} settled in the first week of the window to ${last} in the latest week.`} />
          <ValueChart data={withMa} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <MapView
            height={320}
            points={countyRows
              .filter((row) => COUNTY_BY_CODE[row.code])
              .map((row) => ({
                lat: COUNTY_BY_CODE[row.code]!.lat,
                lng: COUNTY_BY_CODE[row.code]!.lng,
                label: `${row.name} · ${row.claims} claims`,
              }))}
          />
          <div className="overflow-hidden rounded-lg border border-line">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead>County</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Median</TableHead>
                  <TableHead>Reject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countyRows.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="tabular-nums">{row.suppliers}</TableCell>
                    <TableCell className="tabular-nums">{row.claims}</TableCell>
                    <TableCell className="tabular-nums">{formatKes(row.value)}</TableCell>
                    <TableCell className="tabular-nums">{row.median.toFixed(1)}h</TableCell>
                    <TableCell className="tabular-nums">{formatPercent(row.rejection * 100, 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-8">
          <CompositionCharts category={byCat} ownership={byOwn} items={topItems} />
        </div>

        <div className="mt-10">
          <SectionHeading as="h2" title={`Needs attention · ${queuedOld.length + expiring.length + overclaimed.length + hotSites.length}`} />
          <div className="mt-4 overflow-hidden rounded-lg border border-line">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead>Issue</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queuedOld.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>Queued over 48h</TableCell>
                    <TableCell>
                      {claim.entity.legalName} · {claim.site.name}
                    </TableCell>
                    <TableCell>
                      <Link href="/review" className="text-sm underline">
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {expiring.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>Certification expiring</TableCell>
                    <TableCell>
                      {cert.entity.legalName} · {cert.authority}
                    </TableCell>
                    <TableCell>
                      <Link href={`/registry/${cert.entity.slug}`} className="text-sm underline">
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {overclaimed.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>Line over 90% claimed</TableCell>
                    <TableCell>
                      {line.itemName} · {line.contract.site.name}
                    </TableCell>
                    <TableCell>
                      <Link href={`/sites/${line.contract.siteId}`} className="text-sm underline">
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {hotSites.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>Rejection rate above 10%</TableCell>
                    <TableCell>
                      {row.name} · {formatPercent(row.rejection * 100, 0)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/intelligence/counties`} className="text-sm underline">
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageFade>
  );
}

async function loadClaims(since: Date, county: string, site: string) {
  const claims = await prisma.claim.findMany({
    where: {
      submittedAt: { gte: since },
      ...(county !== "all" ? { site: { countyCode: county } } : {}),
      ...(site !== "all" ? { siteId: site } : {}),
    },
    select: {
      id: true,
      entityId: true,
      status: true,
      quantity: true,
      submittedAt: true,
      site: { select: { countyCode: true } },
      contractLine: { select: { itemName: true } },
      valueOutcome: { select: { supplierShare: true } },
      reviews: { select: { decision: true, decidedAt: true } },
    },
  });
  return claims.map((claim) => {
    const approved = claim.reviews.find((r) => r.decision === "APPROVE");
    return {
      id: claim.id,
      entityId: claim.entityId,
      status: claim.status,
      quantity: claim.quantity,
      submittedAt: claim.submittedAt.toISOString(),
      countyCode: claim.site.countyCode,
      itemName: claim.contractLine.itemName,
      valueShare: claim.valueOutcome?.supplierShare ?? 0,
      approvalHours: approved
        ? (approved.decidedAt.getTime() - claim.submittedAt.getTime()) / 36e5
        : null,
    };
  });
}
