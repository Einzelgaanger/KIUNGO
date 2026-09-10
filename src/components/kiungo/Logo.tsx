import Link from "next/link";
import { BrandMark } from "@/components/kiungo/BrandMark";
import { BRAND } from "@/lib/brand";
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
        "inline-flex min-h-11 items-center gap-2.5",
        tone === "dark" ? "text-white" : "text-ink-900",
        className,
      )}
    >
      <BrandMark size={compact ? 32 : 36} />
      {!compact ? (
        <span className="font-display text-lg font-bold tracking-[-0.03em]">{BRAND.name}</span>
      ) : null}
    </Link>
  );
}
