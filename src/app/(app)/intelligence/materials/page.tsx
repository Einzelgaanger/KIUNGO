import type { Metadata } from "next";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { MaterialsCharts } from "@/app/(app)/intelligence/materials/MaterialsCharts";
import { COPY, ITEM_CATALOGUE, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";
import { withDb } from "@/lib/safe-db";

export const metadata: Metadata = { title: "Materials index" };

export default async function MaterialsPage() {
  const prices = await withDb(
    () => prisma.materialPrice.findMany({ orderBy: { weekOf: "asc" } }),
    [],
  );
  const series = ITEM_CATALOGUE.map((item) => ({
    code: item.code,
    name: item.itemName,
    points: prices
      .filter((p) => p.itemCode === item.code && p.countyCode === "047")
      .map((p) => ({ week: p.weekOf.toISOString().slice(0, 10), rate: p.medianRate })),
  }));
  const latest = ITEM_CATALOGUE.map((item) => {
    const rows = prices.filter((p) => p.itemCode === item.code);
    const current = rows.at(-1);
    const prior = rows.filter((r) => r.weekOf.getTime() < (current?.weekOf.getTime() ?? 0)).at(-4);
    return {
      code: item.code,
      name: item.itemName,
      unit: item.unit,
      median: current?.medianRate ?? item.typicalRate,
      change: current && prior ? current.medianRate - prior.medianRate : 0,
      sample: current?.sampleSize ?? 0,
      counties: new Set(rows.map((r) => r.countyCode)).size,
    };
  });
  const countyBar = SEEDED_COUNTY_CODES.map((code) => {
    const row = prices.filter((p) => p.itemCode === "CEM-32.5" && p.countyCode === code).at(-1);
    return { county: countyName(code), rate: row?.medianRate ?? 780 };
  });

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading
          eyebrow="Intelligence"
          title="Materials price index"
          description={COPY.disclaimers.materialsIndex}
        />
        <div className="mt-6">
          <MaterialsCharts series={series} countyBar={countyBar} latest={latest.map((r) => ({ ...r, medianLabel: formatKes(r.median) }))} />
        </div>
      </div>
    </PageFade>
  );
}
