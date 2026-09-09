import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClaimsWeekChart } from "@/components/charts/ClaimsWeekChart";
import { EntityCard } from "@/components/kiungo/EntityCard";
import { MapView } from "@/components/kiungo/MapView";
import { PageFade } from "@/components/kiungo/PageFade";
import { ProfileActions } from "@/components/kiungo/ProfileActions";
import { ReliabilityScore } from "@/components/kiungo/ReliabilityScore";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import { VerificationBadge } from "@/components/kiungo/VerificationBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COPY, ENTITY_CATEGORY_LABELS, countyName } from "@/lib/constants";
import { getEntityBySlug, scoreForEntity } from "@/lib/entities";
import { formatDatePair, formatQuantity, initials } from "@/lib/format";
import { parseStringArray } from "@/lib/json";
import { getSession } from "@/lib/session";
import { startOfIsoWeek } from "@/lib/scoring";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entity = await getEntityBySlug(slug);
    if (!entity) return { title: "Entity" };
    return {
      title: `${entity.legalName} — verified ${ENTITY_CATEGORY_LABELS[entity.category].toLowerCase()} in ${countyName(entity.countyCode)}`,
      description: entity.description ?? `${entity.legalName} on the Kiungo registry.`,
    };
  } catch {
    return { title: "Entity" };
  }
}

export default async function EntityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  let entity: Awaited<ReturnType<typeof getEntityBySlug>> = null;
  try {
    entity = await getEntityBySlug(slug);
  } catch {
    entity = null;
  }
  if (!entity) notFound();

  const score = await scoreForEntity(entity.id);
  const tags = parseStringArray(entity.ownershipTags);
  const subs = parseStringArray(entity.subcategories);
  const latestCert = entity.certifications[0] ?? null;
  const canSeeContact = session.role !== "CITIZEN";
  const party = session.entityId === entity.id;
  const completed = entity.claims.filter((c) => c.status === "SETTLED" || c.status === "APPROVED");
  const capability = Array.from(new Set(entity.claims.map((c) => c.contractLine.itemName)));
  const sites = Array.from(
    new Map(entity.claims.map((c) => [c.site.id, c.site])).values(),
  );

  const weeks: Record<string, { SETTLED: number; APPROVED: number; QUEUED: number; OTHER: number }> = {};
  for (let i = 15; i >= 0; i -= 1) {
    const d = new Date("2026-09-09T12:00:00.000Z");
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = startOfIsoWeek(d);
    weeks[key] = { SETTLED: 0, APPROVED: 0, QUEUED: 0, OTHER: 0 };
  }
  for (const claim of entity.claims) {
    const key = startOfIsoWeek(claim.submittedAt);
    const bucket = weeks[key];
    if (!bucket) continue;
    if (claim.status === "SETTLED") bucket.SETTLED += 1;
    else if (claim.status === "APPROVED") bucket.APPROVED += 1;
    else if (claim.status === "QUEUED") bucket.QUEUED += 1;
    else bucket.OTHER += 1;
  }
  const chartData = Object.entries(weeks).map(([week, counts]) => ({
    week: week.slice(5),
    ...counts,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: entity.legalName,
    identifier: entity.slug,
    url: `https://kiungo.example/registry/${entity.slug}`,
    areaServed: [{ "@type": "AdministrativeArea", name: `${countyName(entity.countyCode)} County` }],
    address: {
      "@type": "PostalAddress",
      addressRegion: countyName(entity.countyCode),
      addressCountry: "KE",
    },
    knowsAbout: capability.slice(0, 8),
    hasCredential: entity.certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: cert.scheme,
      recognizedBy: { "@type": "Organization", name: cert.authority },
      identifier: cert.number,
      validThrough: cert.expiresAt?.toISOString() ?? undefined,
    })),
    ...(entity.reliability != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: entity.reliability,
            bestRating: 100,
            ratingCount: completed.length,
            description: `Kiungo reliability score derived from ${completed.length} verified delivery events`,
          },
        }
      : {}),
  };

  return (
    <PageFade>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        {entity.verification !== "VERIFIED" ? (
          <Alert variant="warning" className="mb-6">
            <AlertDescription>
              This entity has not completed verification. Delivery history is shown but
              certification is unconfirmed.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 font-display text-lg font-semibold text-forest-900">
                {initials(entity.legalName)}
              </span>
              <div>
                <SectionHeading title={entity.legalName} eyebrow={entity.tradingName ?? "Registry"} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge>{ENTITY_CATEGORY_LABELS[entity.category]}</Badge>
                  <span className="text-sm text-ink-600">
                    {countyName(entity.countyCode)}
                    {entity.ward ? ` · ${entity.ward}` : ""}
                  </span>
                  {tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  Member since {entity.yearEstablished ?? entity.createdAt.getUTCFullYear()}
                </p>
                <div className="mt-3">
                  <VerificationBadge certification={latestCert} status={entity.verification} showDetail />
                </div>
              </div>
            </div>

            <section>
              <SectionHeading as="h2" title="Reliability" />
              <div className="mt-4">
                <ReliabilityScore score={entity.reliability} breakdown={score.breakdown} size="lg" />
              </div>
            </section>

            <section>
              <SectionHeading as="h2" title="Delivery history" />
              <div className="mt-4 rounded-lg border border-line bg-surface p-4">
                <ClaimsWeekChart data={chartData} />
              </div>
              <p className="mt-3 text-xs text-ink-400">{COPY.disclaimers.entityValues}</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-line">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead>Ref</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entity.claims.slice(0, 10).map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-xs">{claim.ref}</TableCell>
                        <TableCell>{claim.contractLine.itemName}</TableCell>
                        <TableCell>{formatQuantity(claim.quantity, claim.contractLine.unit)}</TableCell>
                        <TableCell>{claim.site.name}</TableCell>
                        <TableCell>{formatDatePair(claim.submittedAt)}</TableCell>
                        <TableCell>
                          <StatusBadge status={claim.status} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {party ? (
                <p className="mt-2 text-xs text-ink-400">
                  You are a party to these contracts, so values appear on the claim detail pages.
                </p>
              ) : null}
            </section>

            <section>
              <SectionHeading as="h2" title="Certifications" />
              <div className="mt-4 overflow-hidden rounded-lg border border-line">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead>Authority</TableHead>
                      <TableHead>Scheme</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entity.certifications.map((cert) => {
                      const soon =
                        cert.expiresAt &&
                        cert.expiresAt.getTime() - Date.UTC(2026, 8, 9) < 60 * 86400000 &&
                        cert.expiresAt.getTime() > Date.UTC(2026, 8, 9);
                      return (
                        <TableRow
                          key={cert.id}
                          className={soon ? "border-l-2 border-l-gold-500" : undefined}
                        >
                          <TableCell>{cert.authority}</TableCell>
                          <TableCell>{cert.scheme}</TableCell>
                          <TableCell>{cert.class ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{cert.number}</TableCell>
                          <TableCell>{formatDatePair(cert.issuedAt)}</TableCell>
                          <TableCell>{cert.expiresAt ? formatDatePair(cert.expiresAt) : "—"}</TableCell>
                          <TableCell>
                            <StatusBadge status={cert.status} size="sm" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section>
              <SectionHeading as="h2" title="Relationships" />
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                      Supplies to
                    </p>
                    {entity.relationshipsFrom.map((rel) => (
                      <div key={rel.id} className="mt-2">
                        <EntityCard entity={rel.to} variant="compact" />
                        <p className="pl-11 text-xs tabular-nums text-ink-400">
                          {rel.volume} shared claims
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                      Subcontracts from
                    </p>
                    {entity.relationshipsTo.map((rel) => (
                      <div key={rel.id} className="mt-2">
                        <EntityCard entity={rel.from} variant="compact" />
                        <p className="pl-11 text-xs tabular-nums text-ink-400">
                          {rel.volume} shared claims
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <SectionHeading as="h2" title="Capability" />
              <p className="mt-2 text-xs text-ink-400">Derived from verified delivery history.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {subs.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
                {capability.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardContent className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  Contact
                </p>
                {canSeeContact ? (
                  <div className="mt-3 space-y-1 text-sm text-ink-900">
                    <p>{entity.contactName ?? "—"}</p>
                    <p className="font-mono text-xs">{entity.contactPhone ?? "—"}</p>
                    <p>{entity.contactEmail ?? "—"}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-600">
                    Sign in as a verified buyer to see contact details.
                  </p>
                )}
              </CardContent>
            </Card>
            <MapView
              height={200}
              points={[
                ...(entity.lat != null && entity.lng != null
                  ? [{ lat: entity.lat, lng: entity.lng, label: entity.legalName }]
                  : []),
                ...sites.map((site) => ({
                  lat: site.lat,
                  lng: site.lng,
                  label: site.name,
                })),
              ]}
            />
            <Card>
              <CardContent className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  Sites active on
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {sites.map((site) => (
                    <li key={site.id}>
                      <a className="text-ink-900 hover:underline" href={`/sites/${site.id}`}>
                        {site.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <ProfileActions entityId={entity.id} slug={entity.slug} name={entity.legalName} />
          </aside>
        </div>
      </div>
    </PageFade>
  );
}
