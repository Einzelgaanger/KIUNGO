import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Site",
};

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PhasePlaceholder
      phase={4}
      title={id}
      purpose="Site progress, suppliers, claims, contracts and the geofence map."
    />
  );
}
