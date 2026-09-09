"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_STATUS } from "@/components/charts/theme";

export function DeliveriesChart({
  data,
  caption,
}: {
  data: { week: string; SETTLED: number; APPROVED: number; QUEUED: number; OTHER: number }[];
  caption?: string;
}) {
  return (
    <figure className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-2 font-display text-base font-medium">Deliveries per week</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-forest-900)", color: "white", border: "none", borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="SETTLED" stackId="a" fill={CHART_STATUS.SETTLED} />
            <Bar dataKey="APPROVED" stackId="a" fill={CHART_STATUS.APPROVED} />
            <Bar dataKey="QUEUED" stackId="a" fill={CHART_STATUS.QUEUED} />
            <Bar dataKey="OTHER" stackId="a" fill={CHART_STATUS.REJECTED} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-ink-400">
        {caption ??
          "Weekly deliveries have grown from the May baseline, with settled claims forming the largest stack."}
      </figcaption>
    </figure>
  );
}
