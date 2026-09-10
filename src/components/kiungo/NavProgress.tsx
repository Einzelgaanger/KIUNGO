"use client";

import { useNavPending } from "@/components/kiungo/InstantLink";

export function NavProgress() {
  const pending = useNavPending();
  if (!pending) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5 overflow-hidden bg-transparent"
      role="progressbar"
      aria-label="Loading page"
    >
      <div className="h-full w-1/3 animate-pulse bg-[#D3F36B]" />
    </div>
  );
}
