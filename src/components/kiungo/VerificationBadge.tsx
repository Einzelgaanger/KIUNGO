import type { Certification } from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { COPY } from "@/lib/constants";
import { formatDateAbsolute } from "@/lib/format";

export function VerificationBadge({
  certification,
  status,
  showDetail = false,
}: {
  certification?: Certification | null;
  status?: Certification["status"];
  showDetail?: boolean;
}) {
  const resolved = certification?.status ?? status ?? "UNVERIFIED";
  const now = new Date("2026-09-09T12:00:00.000Z");
  const expiresAt = certification?.expiresAt ?? null;
  const days = expiresAt ? differenceInDays(expiresAt, now) : null;
  const expiringSoon = days != null && days >= 0 && days <= 60;

  if (!showDetail) {
    return <StatusBadge status={resolved} />;
  }

  const authority = certification?.authority ?? "the issuing authority";
  const dateLabel = expiresAt ? formatDateAbsolute(expiresAt) : "—";
  let detail = COPY.verification.pending
    .replace("{authority}", authority)
    .replace("{date}", dateLabel);
  if (resolved === "VERIFIED") {
    detail = COPY.verification.verified
      .replace("{authority}", authority)
      .replace("{date}", dateLabel);
  } else if (resolved === "EXPIRED") {
    detail = COPY.verification.expired
      .replace("{authority}", authority)
      .replace("{date}", dateLabel);
  } else if (resolved === "UNVERIFIED") {
    detail = "This entity has not completed verification.";
  }
  if (expiringSoon && resolved === "VERIFIED") {
    detail = COPY.verification.expiringSoon
      .replace("{n}", String(days))
      .replace("{authority}", authority);
  }

  return (
    <div className="space-y-2">
      <StatusBadge status={resolved} />
      {expiringSoon && resolved === "VERIFIED" ? (
        <p className="text-xs text-gold-500">
          Expires soon · {expiresAt ? format(expiresAt, "d MMM yyyy") : ""}
        </p>
      ) : null}
      <p className="text-xs text-ink-600">{detail}</p>
      {certification ? (
        <p className="font-mono text-xs tabular-nums text-ink-400">
          {certification.authority} · {certification.number}
          {certification.class ? ` · ${certification.class}` : ""}
        </p>
      ) : null}
    </div>
  );
}
