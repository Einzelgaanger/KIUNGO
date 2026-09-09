import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Opportunities",
};

export default function OpportunitiesPage() {
  return (
    <PhasePlaceholder
      phase={6}
      title="Opportunities"
      purpose="Matched tenders, packages and citizen requests with reasons, not bare percentages."
    />
  );
}
