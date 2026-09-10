import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="portal-empty flex flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D3F36B]/25">
        <Icon className="h-4 w-4 text-[#0E1F1A]" strokeWidth={1.75} />
      </div>
      <h2 className="mt-3 text-[13px] font-bold text-[#0E1F1A]">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-[11px] font-medium text-[#5A6B7D]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
