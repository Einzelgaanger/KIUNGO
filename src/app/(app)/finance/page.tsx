import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Finance",
};

export default function FinancePage() {
  return (
    <PhasePlaceholder
      phase={6}
      title="Matched finance"
      purpose="Products gated on verification and reliability. Financier role inverts this page into a portfolio."
    />
  );
}
