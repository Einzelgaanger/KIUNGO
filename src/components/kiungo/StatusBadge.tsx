import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Flag,
  HelpCircle,
  MessageCircleQuestion,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CLAIM_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ClaimStatus, VerificationStatus } from "@/types";

const CLAIM_STYLES: Record<ClaimStatus, { className: string; icon: LucideIcon }> = {
  DRAFT: { className: "bg-line-soft text-ink-600", icon: CircleDashed },
  SUBMITTED: { className: "bg-sky-100 text-sky-500", icon: Clock },
  EDGE_CHECKED: { className: "bg-sky-100 text-sky-500", icon: Clock },
  QUEUED: { className: "bg-gold-100 text-gold-500", icon: Clock },
  APPROVED: { className: "bg-lime-100 text-lime-700", icon: CheckCircle2 },
  SETTLED: { className: "bg-forest-100 text-forest-900", icon: CheckCircle2 },
  QUERIED: { className: "bg-gold-100 text-gold-500", icon: MessageCircleQuestion },
  FLAGGED: { className: "bg-clay-100 text-clay-500", icon: Flag },
  REJECTED: { className: "bg-clay-100 text-clay-500", icon: XCircle },
};

const VERIFY_STYLES: Record<VerificationStatus, { className: string; icon: LucideIcon }> = {
  VERIFIED: { className: "bg-lime-100 text-lime-700", icon: ShieldCheck },
  PENDING: { className: "bg-gold-100 text-gold-500", icon: Clock },
  EXPIRED: { className: "bg-clay-100 text-clay-500", icon: ShieldAlert },
  UNVERIFIED: { className: "bg-line-soft text-ink-400", icon: ShieldQuestion },
  SUSPENDED: { className: "bg-clay-100 text-clay-500", icon: ShieldAlert },
};

const CLAIM_STATUSES = new Set<string>(Object.keys(CLAIM_STYLES));

export function StatusBadge({
  status,
  size = "md",
}: {
  status: ClaimStatus | VerificationStatus;
  size?: "sm" | "md";
}) {
  const isClaim = CLAIM_STATUSES.has(status);
  const style = isClaim
    ? CLAIM_STYLES[status as ClaimStatus]
    : VERIFY_STYLES[status as VerificationStatus];
  const label = isClaim
    ? CLAIM_STATUS_LABELS[status as ClaimStatus]
    : VERIFICATION_STATUS_LABELS[status as VerificationStatus];
  const Icon = style?.icon ?? HelpCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        style?.className ?? "bg-line-soft text-ink-600",
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
