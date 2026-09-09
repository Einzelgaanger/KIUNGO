"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_CATEGORICAL } from "@/components/charts/theme";

export function CompositionCharts({
  category,
  ownership,
  items,
}: {
  category: { name: string; value: number }[];
  ownership: { name: string; value: number }[];
  items: { name: string; value: number }[];
}) {
  const total = category.reduce((s, r) => s + r.value, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <figure className="rounded-lg border border-line bg-surface p-4">
        <p className="font-display text-base font-medium">Entities by category</p>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={category} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}>
                {category.map((row, i) => (
                  <Cell key={row.name} fill={CHART_CATEGORICAL[i % CHART_CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="-mt-28 text-center font-display text-2xl font-bold tabular-nums">{total}</p>
        <figcaption className="mt-16 text-xs text-ink-400">Fabricators remain the largest verified group.</figcaption>
      </figure>
      <figure className="rounded-lg border border-line bg-surface p-4">
        <p className="font-display text-base font-medium">Ownership tags</p>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={ownership} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}>
                {ownership.map((row, i) => (
                  <Cell key={row.name} fill={CHART_CATEGORICAL[i % CHART_CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="text-xs text-ink-400">Tags overlap. Jua Kali is the most common on fabricators.</figcaption>
      </figure>
      <figure className="rounded-lg border border-line bg-surface p-4">
        <p className="font-display text-base font-medium">Top items by volume</p>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={items} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "var(--color-ink-400)" }} />
              <Bar dataKey="value" fill="var(--color-forest-900)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="text-xs text-ink-400">Volume is claimed units on verified deliveries, not survey estimates.</figcaption>
      </figure>
    </div>
  );
}
