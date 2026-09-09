import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Registry",
};

export default function RegistryPage() {
  return (
    <PhasePlaceholder
      phase={3}
      title="Verified entity registry"
      purpose="Search, filter and open 180 housing-sector entities with certifications and reliability scores."
    />
  );
}
