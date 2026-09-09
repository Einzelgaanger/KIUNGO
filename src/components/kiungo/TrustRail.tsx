"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";

export function TrustRail({
  entities,
  claims,
  counties,
}: {
  entities: number;
  claims: number;
  counties: number;
}) {
  const [e, setE] = useState(0);
  const [c, setC] = useState(0);
  useEffect(() => {
    const frames = 18;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setE(Math.round((entities * i) / frames));
      setC(Math.round((claims * i) / frames));
      if (i >= frames) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [entities, claims]);
  return (
    <p className="mt-10 font-sans text-sm text-forest-100">
      <span className="tabular-nums text-lime-500">{formatNumber(e)}</span> verified entities ·{" "}
      <span className="tabular-nums text-lime-500">{formatNumber(c)}</span> evidenced deliveries ·{" "}
      <span className="tabular-nums text-lime-500">{counties}</span> counties
    </p>
  );
}
