import Link from "next/link";
import type { Claim, Contract, ContractLine, Site, ValueOutcome } from "@prisma/client";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { formatDatePair, formatKes, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ClaimListItem = Claim & {
  contractLine: ContractLine;
  site: Site;
  contract?: Contract;
  valueOutcome?: ValueOutcome | null;
};

export function ClaimRow({
  claim,
  href,
  showValue = false,
}: {
  claim: ClaimListItem;
  href: string;
  showValue?: boolean;
}) {
  return (
    <Link
      href={href}
      className="hidden min-h-14 items-center gap-4 border-b border-line-soft px-3 py-3 text-sm hover:bg-forest-50 md:flex"
    >
      <span className="w-36 font-mono text-xs tabular-nums">{claim.ref}</span>
      <span className="min-w-0 flex-1 truncate">{claim.contractLine.itemName}</span>
      <span className="w-28 tabular-nums">
        {formatQuantity(claim.quantity, claim.contractLine.unit)}
      </span>
      <span className="w-40 truncate text-ink-600">{claim.site.name}</span>
      <span className="w-44 text-xs text-ink-400">{formatDatePair(claim.submittedAt)}</span>
      <StatusBadge status={claim.status} size="sm" />
      {showValue ? (
        <span className="w-32 text-right tabular-nums">
          {claim.valueOutcome ? formatKes(claim.valueOutcome.grossAmount) : "—"}
        </span>
      ) : null}
    </Link>
  );
}

export function ClaimCard({
  claim,
  href,
  showValue = false,
}: {
  claim: ClaimListItem;
  href: string;
  showValue?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border border-line bg-surface p-4 shadow-xs md:hidden",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs tabular-nums">{claim.ref}</p>
        <StatusBadge status={claim.status} size="sm" />
      </div>
      <p className="mt-2 font-medium text-ink-900">{claim.contractLine.itemName}</p>
      <p className="mt-1 text-sm text-ink-600">
        {formatQuantity(claim.quantity, claim.contractLine.unit)} · {claim.site.name}
      </p>
      <p className="mt-1 text-xs text-ink-400">{formatDatePair(claim.submittedAt)}</p>
      {showValue && claim.valueOutcome ? (
        <p className="mt-2 text-sm tabular-nums">{formatKes(claim.valueOutcome.grossAmount)}</p>
      ) : null}
    </Link>
  );
}
