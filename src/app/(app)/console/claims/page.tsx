import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { ClaimCard, ClaimRow } from "@/components/kiungo/ClaimRow";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { COPY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";
import type { ClaimStatus } from "@/types";

export const metadata: Metadata = { title: "Claims" };

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  const { status } = await searchParams;
  const entityId = session.entityId;
  const claims = entityId
    ? await withDb(
        () =>
          prisma.claim.findMany({
            where: {
              entityId,
              ...(status ? { status: status as ClaimStatus } : {}),
            },
            include: { contractLine: true, site: true, valueOutcome: true },
            orderBy: { submittedAt: "desc" },
          }),
        [],
      )
    : [];

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Deliver" title="Delivery claims" />
        {claims.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={COPY.empty.claimsNone.title}
            description={COPY.empty.claimsNone.description}
          />
        ) : (
          <>
            <div className="mt-6 hidden rounded-lg border border-line md:block">
              {claims.map((claim) => (
                <ClaimRow key={claim.id} claim={claim} href={`/console/claims/${claim.id}`} showValue />
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:hidden">
              {claims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} href={`/console/claims/${claim.id}`} showValue />
              ))}
            </div>
          </>
        )}
      </div>
    </PageFade>
  );
}
