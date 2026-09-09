import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Submit a delivery",
};

export default function NewClaimPage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="Submit a delivery"
      purpose="Four-step claim wizard: contract line, quantity, evidence and confirm — under 60 seconds."
    />
  );
}
