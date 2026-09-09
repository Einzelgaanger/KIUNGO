import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { OpportunityBoard } from "@/app/(app)/opportunities/OpportunityBoard";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parseStringArray } from "@/lib/json";
import { scoreOpportunityMatch } from "@/lib/matching";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";
import type { OwnershipTag } from "@/types";

export const metadata: Metadata = { title: "Opportunities" };

export default async function OpportunitiesPage() {
  const session = await getSession();
  const entityId = session.entityId;
  const [entity, opportunities] = await withDb(
    () =>
      Promise.all([
        entityId ? prisma.entity.findUnique({ where: { id: entityId } }) : Promise.resolve(null),
        prisma.opportunity.findMany({ orderBy: { closesAt: "asc" } }),
      ]),
    [null, []],
  );

  const ranked = opportunities.map((opp) => {
    const match = entity
      ? scoreOpportunityMatch(
          {
            countyCode: entity.countyCode,
            category: entity.category,
            ownershipTags: parseStringArray(entity.ownershipTags) as OwnershipTag[],
            reliability: entity.reliability,
          },
          {
            countyCode: opp.countyCode,
            category: opp.category,
            reservedFor: parseStringArray(opp.reservedFor) as OwnershipTag[],
          },
        )
      : { score: 0, reasons: [] };
    return { ...opp, match };
  }).sort((a, b) => b.match.score - a.match.score);

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Discover" title="Opportunities" />
        {ranked.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={COPY.empty.opportunitiesNone.title}
            description={COPY.empty.opportunitiesNone.description}
          />
        ) : (
          <div className="mt-6">
            <OpportunityBoard
              items={ranked.map((opp) => ({
                id: opp.id,
                ref: opp.ref,
                title: opp.title,
                kind: opp.kind,
                buyerName: opp.buyerName,
                countyCode: opp.countyCode,
                valueEst: opp.valueEst,
                closesAt: opp.closesAt.toISOString(),
                reservedFor: parseStringArray(opp.reservedFor),
                description: opp.description,
                reasons: opp.match.reasons,
                score: opp.match.score,
              }))}
            />
          </div>
        )}
      </div>
    </PageFade>
  );
}
