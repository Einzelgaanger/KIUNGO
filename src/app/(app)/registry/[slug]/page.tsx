import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Entity profile",
};

export default async function EntityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PhasePlaceholder
      phase={3}
      title={slug}
      purpose="Public entity profile with JSON-LD, certifications, delivery history and relationships."
    />
  );
}
