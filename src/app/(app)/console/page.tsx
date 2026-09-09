import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Console",
};

export default function ConsolePage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="Supplier console"
      purpose="Action-needed claims, contract balances and the submit-delivery path live here."
    />
  );
}
