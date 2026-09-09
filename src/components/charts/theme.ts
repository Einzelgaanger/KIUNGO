export const CHART_STATUS = {
  SETTLED: "var(--color-forest-900)",
  APPROVED: "var(--color-lime-700)",
  QUEUED: "var(--color-gold-500)",
  QUERIED: "color-mix(in srgb, var(--color-gold-500) 60%, transparent)",
  FLAGGED: "var(--color-clay-500)",
  REJECTED: "var(--color-clay-500)",
} as const;

export const CHART_CATEGORICAL = [
  "var(--color-forest-900)",
  "var(--color-lime-700)",
  "var(--color-gold-500)",
  "var(--color-sky-500)",
  "var(--color-forest-600)",
  "var(--color-clay-500)",
] as const;
