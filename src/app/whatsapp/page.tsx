import type { Metadata } from "next";
import { WhatsAppDemo } from "@/app/whatsapp/WhatsAppDemo";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";

export const metadata: Metadata = { title: "WhatsApp demo" };

export default async function WhatsAppPage() {
  const line = await withDb(
    () =>
      prisma.contractLine.findFirst({
        where: { id: "line-0001" },
        include: { contract: { include: { site: true } } },
      }),
    null,
  );
  return (
    <WhatsAppDemo
      contractLineId={line?.id ?? ""}
      siteLat={line?.contract.site.lat ?? -1.3092}
      siteLng={line?.contract.site.lng ?? 36.8721}
    />
  );
}
