import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  tone = "light",
  compact = false,
  className,
}: {
  href?: string;
  tone?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 min-h-11",
        tone === "dark" ? "text-white" : "text-ink-900",
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-lime-500 text-forest-900 font-display text-sm font-bold">
        K
      </span>
      {!compact ? (
        <span className="font-display text-lg font-semibold tracking-[-0.02em]">
          Kiungo
        </span>
      ) : null}
    </Link>
  );
}
