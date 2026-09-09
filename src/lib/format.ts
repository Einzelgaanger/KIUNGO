import { format, formatDistanceToNowStrict, isValid } from "date-fns";

export function formatKes(amount: number): string {
  const rounded = Math.round(amount);
  return `KSh ${new Intl.NumberFormat("en-KE").format(rounded)}`;
}

/** Compact money for stat cards only — never use in tables. */
export function formatKesCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}KSh ${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}KSh ${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}KSh ${(abs / 1_000).toFixed(1)}k`;
  }
  return formatKes(amount);
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatQuantity(value: number, unit: string): string {
  const digits = Number.isInteger(value) ? 0 : 1;
  return `${formatNumber(value, digits)} ${unit}`;
}

export function formatDateAbsolute(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "d MMM yyyy");
}

export function formatDateTimeAbsolute(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "d MMM yyyy, HH:mm");
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

/** Always relative + absolute in data contexts. */
export function formatDatePair(date: Date | string): string {
  return `${formatRelative(date)} · ${formatDateAbsolute(date)}`;
}

export function formatHashPrefix(hash: string, length = 8): string {
  if (hash.length <= length) return hash;
  return `${hash.slice(0, length)}…`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${formatNumber(value, digits)}%`;
}

export function formatLatLng(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function initials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "K";
  if (parts.length === 1) {
    const first = parts[0];
    return (first ? first.slice(0, 2) : "K").toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
