"use client";

import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ValueChart({
  data,
}: {
  data: { week: string; value: number; ma: number }[];
}) {
  return (
    <figure className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-2 font-display text-base font-medium">Value settled per week</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-forest-900)", color: "white", border: "none", borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="value" fill="var(--color-forest-900)" />
            <Line dataKey="ma" stroke="var(--color-lime-500)" strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-ink-400">
        Supplier share settled each week, with a four-week moving average as the dashed line.
      </figcaption>
    </figure>
  );
}
