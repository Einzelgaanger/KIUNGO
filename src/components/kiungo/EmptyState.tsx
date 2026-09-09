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
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="rounded-full bg-forest-100 p-4">
        <Icon className="h-6 w-6 text-forest-900" />
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
        {title}
      </h2>
      <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-600">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
