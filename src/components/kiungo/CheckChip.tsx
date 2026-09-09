import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckChip({ passed, label }: { passed: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        passed ? "bg-lime-100 text-lime-700" : "bg-clay-100 text-clay-500",
      )}
    >
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {passed ? "Pass" : "Fail"} · {label}
    </span>
  );
}
