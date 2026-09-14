import type { Metadata } from "next";
import { ShortlistBoard } from "@/app/(app)/shortlist/ShortlistBoard";

export const metadata: Metadata = { title: "Shortlist" };

export default function ShortlistPage() {
  return <ShortlistBoard />;
}
