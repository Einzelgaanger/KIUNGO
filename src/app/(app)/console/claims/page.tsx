import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { ClaimCard, ClaimRow } from "@/components/kiungo/ClaimRow";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { COPY, SEEDED_COUNTY_CODES, countyName } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";
import type { ClaimStatus } from "@/types";

export const metadata: Metadata = { title: "Claims" };

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; county?: string }>;
}) {
  const session = await getSession();
  const { status, county } = await searchParams;
  const entityId = session.entityId;
  const claims = entityId
    ? await withDb(
        () =>
          prisma.claim.findMany({
            where: {
              entityId,
              ...(status ? { status: status as ClaimStatus } : {}),
              ...(county ? { site: { countyCode: county } } : {}),
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
        <form className="mt-4">
          <label className="text-sm text-ink-600">
            County
            <select
              name="county"
              defaultValue={county ?? ""}
              className="ml-2 min-h-11 rounded-md border border-line bg-surface px-3 text-sm"
            >
              <option value="">All counties</option>
              {SEEDED_COUNTY_CODES.map((code) => (
                <option key={code} value={code}>
                  {countyName(code)}
                </option>
              ))}
            </select>
          </label>
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <button type="submit" className="ml-2 text-sm underline">
            Apply
          </button>
        </form>
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
