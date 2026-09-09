import type { Metadata } from "next";
import { BuildJourney } from "@/app/(app)/build/BuildJourney";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";

export const metadata: Metadata = { title: "I want to build a house" };

export default async function BuildPage() {
  const entities = await withDb(
    () =>
      prisma.entity.findMany({
        where: { verification: "VERIFIED" },
        take: 27,
        orderBy: { reliability: "desc" },
      }),
    [],
  );
  const mortgages = await withDb(
    () => prisma.financeProduct.findMany({ where: { kind: "MORTGAGE" } }),
    [],
  );
  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading
          eyebrow="Citizen"
          title="I want to build a house"
          description="An indicative band from verified delivery rates, then a path through the value chain."
        />
        <div className="mt-8">
          <BuildJourney
            entities={entities.map((e) => ({
              id: e.id,
              slug: e.slug,
              legalName: e.legalName,
              category: e.category,
              countyCode: e.countyCode,
            }))}
            mortgages={mortgages.map((p) => ({
              id: p.id,
              name: p.productName,
              provider: p.providerName,
            }))}
          />
        </div>
      </div>
    </PageFade>
  );
}
