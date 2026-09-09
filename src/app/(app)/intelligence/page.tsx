import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Intelligence",
};

export default function IntelligencePage() {
  return (
    <PhasePlaceholder
      phase={6}
      title="Programme dashboard"
      purpose="Deliveries, value settled, county league table and the needs-attention exceptions panel."
    />
  );
}
