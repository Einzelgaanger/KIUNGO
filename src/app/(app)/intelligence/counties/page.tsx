import type { Metadata } from "next";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { MapView } from "@/components/kiungo/MapView";
import { CountyLeague } from "@/app/(app)/intelligence/counties/CountyLeague";
import { COUNTY_BY_CODE, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";

export const metadata: Metadata = { title: "County intelligence" };

export default async function CountiesPage() {
  const claims = await withDb(
    () =>
      prisma.claim.findMany({
        include: { site: true, entity: true, contractLine: true, valueOutcome: true },
      }),
    [],
  );
  const rows = SEEDED_COUNTY_CODES.map((code) => {
    const subset = claims.filter((c) => c.site.countyCode === code);
    const items = Object.entries(
      subset.reduce<Record<string, number>>((acc, c) => {
        acc[c.contractLine.itemName] = (acc[c.contractLine.itemName] ?? 0) + c.quantity;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0];
    const entities = Object.entries(
      subset.reduce<Record<string, number>>((acc, c) => {
        acc[c.entity.legalName] = (acc[c.entity.legalName] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0];
    return {
      code,
      name: countyName(code),
      claims: subset.length,
      suppliers: new Set(subset.map((c) => c.entityId)).size,
      value: subset.reduce((s, c) => s + (c.valueOutcome?.supplierShare ?? 0), 0),
      topItem: items?.[0] ?? "—",
      topEntity: entities?.[0] ?? "—",
    };
  }).sort((a, b) => b.claims - a.claims);

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Intelligence" title="County activity" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <MapView
            height={420}
            points={rows.flatMap((row) => {
              const c = COUNTY_BY_CODE[row.code];
              return c ? [{ lat: c.lat, lng: c.lng, label: `${row.name} · ${row.claims}` }] : [];
            })}
          />
          <CountyLeague rows={rows} />
        </div>
      </div>
    </PageFade>
  );
}
