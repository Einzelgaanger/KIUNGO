import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/kiungo/PhasePlaceholder";

export const metadata: Metadata = {
  title: "My profile",
};

export default function ProfilePage() {
  return (
    <PhasePlaceholder
      phase={4}
      title="My entity profile"
      purpose="Certifications, reliability breakdown and the same public profile the registry shows."
    />
  );
}
