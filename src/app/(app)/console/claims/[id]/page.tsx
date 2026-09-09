import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Claim detail",
};

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PhasePlaceholder
      phase={4}
      title={id}
      purpose="Evidence, edge checks, timeline and the 80/10/10 value receipt."
    />
  );
}
