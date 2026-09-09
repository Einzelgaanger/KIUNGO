import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Review claim",
};

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PhasePlaceholder
      phase={4}
      title={id}
      purpose="Full review screen with evidence, edge checks and Approve / Query / Reject."
    />
  );
}
