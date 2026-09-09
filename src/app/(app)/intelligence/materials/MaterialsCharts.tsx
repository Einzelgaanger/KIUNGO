"use client";

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_CATEGORICAL } from "@/components/charts/theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MaterialsCharts({
  series,
  countyBar,
  latest,
}: {
  series: { code: string; name: string; points: { week: string; rate: number }[] }[];
  countyBar: { county: string; rate: number }[];
  latest: { code: string; name: string; unit: string; median: number; medianLabel: string; change: number; sample: number; counties: number }[];
}) {
  const weeks = series[0]?.points.map((p) => p.week.slice(5)) ?? [];
  const merged = weeks.map((week, i) => {
    const row: Record<string, number | string> = { week };
    for (const s of series) {
      row[s.code] = s.points[i]?.rate ?? 0;
    }
    return row;
  });

  return (
    <div className="space-y-8">
      <figure className="rounded-lg border border-line bg-surface p-4">
        <p className="font-display text-base font-medium">Median rate by week · Nairobi</p>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={merged}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} />
              <Tooltip />
              {series.map((s, i) => (
                <Line key={s.code} type="monotone" dataKey={s.code} stroke={CHART_CATEGORICAL[i] ?? "var(--color-forest-900)"} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="mt-2 text-xs text-ink-400">
          Prices are medians of rates on verified delivery claims, not survey estimates. Sample sizes are shown for every point.
        </figcaption>
      </figure>
      <figure className="rounded-lg border border-line bg-surface p-4">
        <p className="font-display text-base font-medium">Cement 32.5N by county</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={countyBar}>
              <XAxis dataKey="county" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} />
              <YAxis />
              <Bar dataKey="rate" fill="var(--color-forest-900)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="mt-2 text-xs text-ink-400">County comparison for a single catalogue item.</figcaption>
      </figure>
      <div className="overflow-hidden rounded-lg border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead>Item</TableHead>
              <TableHead>Median</TableHead>
              <TableHead>4-week change</TableHead>
              <TableHead>Sample</TableHead>
              <TableHead>Counties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latest.map((row) => (
              <TableRow key={row.code}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="tabular-nums">{row.medianLabel}</TableCell>
                <TableCell className="tabular-nums">{row.change}</TableCell>
                <TableCell className="tabular-nums">{row.sample}</TableCell>
                <TableCell className="tabular-nums">{row.counties}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
