import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "County intelligence",
};

export default function CountiesPage() {
  return (
    <PhasePlaceholder
      phase={6}
      title="County activity"
      purpose="Map and ranked counties with suppliers, claims and top items."
    />
  );
}
