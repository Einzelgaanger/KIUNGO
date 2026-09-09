import type { Metadata } from "next";
import { Suspense } from "react";
import { ClaimWizard } from "@/app/(app)/console/claims/new/ClaimWizard";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Submit a delivery" };

export default async function NewClaimPage() {
  const session = await getSession();
  const entityId = session.entityId;
  const lines = entityId
    ? await withDb(
        () =>
          prisma.contractLine.findMany({
            where: { contract: { supplierId: entityId, status: "ACTIVE" } },
            include: { contract: { include: { site: true, buyer: true } } },
          }),
        [],
      )
    : [];

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Deliver" title="Submit a delivery" description="Four steps. Under 60 seconds." />
        <div className="mt-8">
          <Suspense>
            <ClaimWizard
              lines={lines.map((line) => ({
                id: line.id,
                itemName: line.itemName,
                unit: line.unit,
                unitRate: line.unitRate,
                quantityTotal: line.quantityTotal,
                quantityClaimed: line.quantityClaimed,
                contractId: line.contractId,
                contractRef: line.contract.ref,
                siteName: line.contract.site.name,
                siteLat: line.contract.site.lat,
                siteLng: line.contract.site.lng,
                geofenceM: line.contract.site.geofenceM,
                buyer: line.contract.buyer.legalName,
              }))}
            />
          </Suspense>
        </div>
      </div>
    </PageFade>
  );
}
