import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Review queue",
};

export default function ReviewPage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="Review queue"
      purpose="Site-grouped approval queue with keyboard shortcuts, batch approve rules and evidence preview."
    />
  );
}
