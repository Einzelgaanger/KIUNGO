import type { Metadata } from "next";
import { CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { ReviewQueue } from "@/app/(app)/review/ReviewQueue";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Review queue" };

export default async function ReviewPage() {
  const items = await prisma.claim.findMany({
    where: { status: { in: ["QUEUED", "EDGE_CHECKED", "SUBMITTED", "FLAGGED"] } },
    include: { entity: true, contractLine: true, site: true, evidence: true, edgeChecks: true },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Deliver" title="Review queue" description={`${items.length} waiting.`} />
        {items.length === 0 ? (
          <EmptyState
            icon={CheckCheck}
            title={COPY.empty.reviewClear.title}
            description={COPY.empty.reviewClear.description.replace("{time}", "3 hours 12 minutes")}
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
            <ReviewQueue items={items} />
          </div>
        )}
      </div>
    </PageFade>
  );
}
