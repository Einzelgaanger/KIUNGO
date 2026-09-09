import type { Metadata } from "next";
import Link from "next/link";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db";
import { formatDatePair, formatKes } from "@/lib/format";
import { withDb } from "@/lib/safe-db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Contracts" };

export default async function ContractsPage() {
  const session = await getSession();
  const entityId = session.entityId;
  const contracts = entityId
    ? await withDb(
        () =>
          prisma.contract.findMany({
            where: { supplierId: entityId },
            include: { site: true, buyer: true, lines: true },
            orderBy: { awardedAt: "desc" },
          }),
        [],
      )
    : [];

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading eyebrow="Deliver" title="Contract lines" />
        <div className="mt-6 space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="rounded-lg border border-line bg-surface p-5">
              <p className="font-mono text-xs">{contract.ref}</p>
              <p className="mt-1 font-medium">{contract.title}</p>
              <p className="text-sm text-ink-600">
                {contract.buyer.legalName} · {contract.site.name} · {formatDatePair(contract.expiresAt)}
              </p>
              <div className="mt-4 space-y-3">
                {contract.lines.map((line) => {
                  const pct = line.quantityTotal === 0 ? 0 : (line.quantityClaimed / line.quantityTotal) * 100;
                  return (
                    <div key={line.id}>
                      <div className="flex justify-between text-sm">
                        <span>{line.itemName}</span>
                        <span className="tabular-nums">{formatKes(line.unitRate)} / {line.unit}</span>
                      </div>
                      <Progress value={Math.min(100, pct)} className="mt-1" />
                      <div className="mt-1 flex justify-between text-xs text-ink-400">
                        <span className="tabular-nums">
                          {line.quantityClaimed} / {line.quantityTotal} {line.unit}
                        </span>
                        <Button asChild variant="link" size="sm">
                          <Link href={`/console/claims/new?line=${line.id}`}>Claim against this</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageFade>
  );
}
