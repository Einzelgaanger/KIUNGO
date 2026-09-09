import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Materials index",
};

export default function MaterialsPage() {
  return (
    <PhasePlaceholder
      phase={6}
      title="Materials price index"
      purpose="Median rates from verified delivery claims, not survey estimates."
    />
  );
}
