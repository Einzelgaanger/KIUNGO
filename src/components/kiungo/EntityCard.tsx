import type { Certification, Entity } from "@prisma/client";
import Link from "next/link";
import { ReliabilityScore } from "@/components/kiungo/ReliabilityScore";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { VerificationBadge } from "@/components/kiungo/VerificationBadge";
import { Badge } from "@/components/ui/badge";
import { ENTITY_CATEGORY_LABELS, countyName } from "@/lib/constants";
import { initials } from "@/lib/format";
import { parseStringArray } from "@/lib/json";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type EntityCardModel = Entity & {
  certifications?: Certification[];
  _count?: { claims: number };
};

export function EntityCard({
  entity,
  variant = "grid",
}: {
  entity: EntityCardModel;
  variant?: "grid" | "row" | "compact";
}) {
  const cert = entity.certifications?.[0] ?? null;
  const tags = parseStringArray(entity.ownershipTags);
  const href = `/registry/${entity.slug}`;

  if (variant === "compact") {
    return (
      <Link href={href} className="flex min-h-11 items-center gap-3 rounded-md px-1 py-1 hover:bg-forest-50">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 font-display text-xs font-medium text-forest-900">
          {initials(entity.legalName)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink-900">{entity.legalName}</span>
          <span className="block text-xs text-ink-400">{countyName(entity.countyCode)}</span>
        </span>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface p-4 shadow-xs transition-colors duration-150 hover:border-forest-600",
        variant === "row" && "flex items-center gap-4 p-4 md:p-5",
      )}
    >
      <Link href={href} className={cn("flex items-start gap-3", variant === "row" && "flex-1")}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-100 font-display text-sm font-medium text-forest-900">
          {initials(entity.legalName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-medium text-ink-900">
            {entity.legalName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{ENTITY_CATEGORY_LABELS[entity.category]}</Badge>
            <span className="text-xs text-ink-400">{countyName(entity.countyCode)}</span>
          </div>
          {variant === "grid" && tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag.replace("_", " ")}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
      <div className={cn("mt-4 flex flex-wrap items-center gap-2", variant === "row" && "mt-0")}>
        {cert ? (
          <Popover>
            <PopoverTrigger className="min-h-11" aria-label="Certification detail">
              <VerificationBadge certification={cert} />
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm font-medium">{cert.authority}</p>
              <p className="font-mono text-xs">{cert.number}</p>
              {cert.expiresAt ? (
                <p className="mt-1 text-xs text-ink-600">
                  Valid to {String(cert.expiresAt).slice(0, 10)}
                </p>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : (
          <StatusBadge status={entity.verification} />
        )}
        <ReliabilityScore score={entity.reliability} />
        <span className="text-xs tabular-nums text-ink-400">
          {entity._count?.claims ?? 0} deliveries
        </span>
      </div>
    </div>
  );
}
