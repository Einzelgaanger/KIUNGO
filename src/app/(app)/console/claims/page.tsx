import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Claims",
};

export default function ClaimsPage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="Delivery claims"
      purpose="Filterable list of the signed-in supplier's claims, with status and evidence."
    />
  );
}
