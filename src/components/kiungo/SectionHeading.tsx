import type { ReactNode } from "react";
import { PageHeader } from "@/components/kiungo/PageHeader";
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
  if (as === "h1") {
    return (
      <div className={className}>
        <PageHeader title={title} subtitle={description} eyebrow={eyebrow} actions={action} />
      </div>
    );
  }

  return (
    <header className={cn("portal-section__head", className)}>
      <div>
        {eyebrow ? (
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5A6B7D]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="portal-section__title">{title}</h2>
        {description ? <p className="portal-section__desc">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
