import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-4 w-1 shrink-0 rounded-full bg-[#D3F36B]" />
          <div>
            {eyebrow ? (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 max-w-3xl text-xs font-medium leading-snug text-white/65">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0 pl-3.5 sm:pl-0">{actions}</div> : null}
      </div>
    </header>
  );
}
