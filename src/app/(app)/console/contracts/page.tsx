import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Contracts",
};

export default function ContractsPage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="Contract lines"
      purpose="Active contract lines, remaining balances and claim-against-this actions."
    />
  );
}
