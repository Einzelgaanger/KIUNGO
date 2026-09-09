import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "I want to build a house",
};

export default function BuildPage() {
  return (
    <PhasePlaceholder
      phase={7}
      title="I want to build a house"
      purpose="Citizen journey from location and house type to a banded estimate and matched counterparties."
    />
  );
}
