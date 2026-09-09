"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapPoint } from "@/components/kiungo/MapPanel";

const Inner = dynamic(() => import("@/components/kiungo/MapPanel").then((m) => m.MapPanel), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full rounded-lg" />,
});

export function MapView(props: {
  points: MapPoint[];
  height?: number;
  connect?: boolean;
  driftLabel?: string;
}) {
  return <Inner {...props} />;
}
