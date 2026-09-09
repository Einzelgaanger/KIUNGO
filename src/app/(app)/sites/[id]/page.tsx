import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimRow } from "@/components/kiungo/ClaimRow";
import { EntityCard } from "@/components/kiungo/EntityCard";
import { MapView } from "@/components/kiungo/MapView";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatCard } from "@/components/kiungo/StatCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { countyName } from "@/lib/constants";
import { formatDatePair } from "@/lib/format";

export const metadata: Metadata = { title: "Site" };

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.site.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      programme: true,
      claims: { include: { contractLine: true, site: true, entity: true }, take: 20, orderBy: { submittedAt: "desc" } },
      contracts: { include: { supplier: true, lines: true } },
    },
  });
  if (!site) notFound();
  const pct = site.unitsPlanned === 0 ? 0 : (site.unitsComplete / site.unitsPlanned) * 100;
  const suppliers = Array.from(new Map(site.contracts.map((c) => [c.supplier.id, c.supplier])).values());

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading
          eyebrow={site.programme.name}
          title={site.name}
          description={`${countyName(site.countyCode)} · ${formatDatePair(site.startedAt)} → ${formatDatePair(site.targetAt)}`}
        />
        <Progress value={pct} className="mt-4" />
        <p className="mt-2 text-sm tabular-nums text-ink-600">
          {site.unitsComplete} / {site.unitsPlanned} units complete
        </p>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Claims" value={site.claims.length} />
              <StatCard label="Suppliers" value={suppliers.length} />
              <StatCard label="Units planned" value={site.unitsPlanned} />
            </div>
            <div className="mt-4">
              <MapView height={280} points={[{ lat: site.lat, lng: site.lng, label: site.name }]} />
            </div>
          </TabsContent>
          <TabsContent value="suppliers">
            <div className="grid gap-3 md:grid-cols-2">
              {suppliers.map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="claims">
            <div className="rounded-lg border border-line">
              {site.claims.map((claim) => (
                <ClaimRow key={claim.id} claim={claim} href={`/console/claims/${claim.id}`} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="contracts">
            <ul className="space-y-3">
              {site.contracts.map((contract) => (
                <li key={contract.id} className="rounded-lg border border-line bg-surface p-4">
                  <Link href="/console/contracts" className="font-mono text-xs">
                    {contract.ref}
                  </Link>
                  <p className="font-medium">{contract.title}</p>
                  <p className="text-sm text-ink-600">{contract.supplier.legalName}</p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </PageFade>
  );
}
