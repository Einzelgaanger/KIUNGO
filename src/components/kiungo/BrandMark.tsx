import { cn } from "@/lib/utils";

/** Kiungo mark: forest tile + interlocking link (not the IOUX U). */
export function BrandMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#0E1F1A" />
      <path
        d="M13.5 20a5.2 5.2 0 0 1 5.2-5.2h4.4"
        fill="none"
        stroke="#F3FAF5"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <path
        d="M26.5 20a5.2 5.2 0 0 1-5.2 5.2h-4.4"
        fill="none"
        stroke="#F3FAF5"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <circle cx="29.5" cy="11" r="3.4" fill="#D3F36B" />
    </svg>
  );
}

export function NavBrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-7 w-7", className)} aria-hidden>
      <path
        d="M6.5 12a4 4 0 0 1 4-4H14"
        fill="none"
        stroke="#F3FAF5"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17.5 12a4 4 0 0 1-4 4H10"
        fill="none"
        stroke="#F3FAF5"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="6" r="2.6" fill="#D3F36B" />
    </svg>
  );
}
