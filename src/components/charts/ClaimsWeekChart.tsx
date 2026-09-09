"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_STATUS } from "@/components/charts/theme";

export function ClaimsWeekChart({
  data,
}: {
  data: { week: string; SETTLED: number; APPROVED: number; QUEUED: number; OTHER: number }[];
}) {
  return (
    <figure>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={4}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-forest-900)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Bar dataKey="SETTLED" stackId="s" fill={CHART_STATUS.SETTLED} />
            <Bar dataKey="APPROVED" stackId="s" fill={CHART_STATUS.APPROVED} />
            <Bar dataKey="QUEUED" stackId="s" fill={CHART_STATUS.QUEUED} />
            <Bar dataKey="OTHER" stackId="s" fill={CHART_STATUS.REJECTED} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-ink-400">
        Weekly claims over the last 16 weeks, coloured by status.
      </figcaption>
    </figure>
  );
}
