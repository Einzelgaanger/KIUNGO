import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as = "h1",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  const Title = as;
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <div className="h-[3px] w-9 rounded-full bg-lime-500" />
        {eyebrow ? (
          <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            {eyebrow}
          </p>
        ) : null}
        <Title
          className={cn(
            "mt-2 font-display font-semibold tracking-[-0.02em] text-ink-900",
            as === "h1" ? "text-2xl md:text-3xl" : "text-lg md:text-xl tracking-[-0.01em]",
          )}
        >
          {title}
        </Title>
        {description ? (
          <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
