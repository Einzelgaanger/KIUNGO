import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "How it works",
};

export default function HowItWorksPage() {
  return (
    <div className="bg-paper text-ink-900">
      <PhasePlaceholder
        phase={7}
        title="How Kiungo works"
        purpose="The delivery loop, the public API and the settlement split are documented here."
      />
    </div>
  );
}
