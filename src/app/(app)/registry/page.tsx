import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, SearchX, Table as TableIcon } from "lucide-react";
import { EntityCard } from "@/components/kiungo/EntityCard";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { RegistryFilters } from "@/components/kiungo/RegistryFilters";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { CardGridSkeleton } from "@/components/kiungo/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RegistryTable } from "@/app/(app)/registry/RegistryTable";
import { COPY, ENTITY_CATEGORY_LABELS, PAGE_SIZE, countyName } from "@/lib/constants";
import { parseList, searchEntities } from "@/lib/entities";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Registry",
  description: "Verified participants in Kenya's housing and construction sector.",
};

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const view = (typeof raw.view === "string" ? raw.view : "grid") === "table" ? "table" : "grid";
  const page = Number(typeof raw.page === "string" ? raw.page : 1) || 1;

  let result: Awaited<ReturnType<typeof searchEntities>> | null = null;
  let error: string | null = null;
  try {
    result = await searchEntities({
      q: typeof raw.q === "string" ? raw.q : undefined,
      category: parseList(raw.category),
      county: parseList(raw.county),
      verification: parseList(raw.verification),
      ownership: parseList(raw.ownership),
      minReliability: raw.minReliability ? Number(raw.minReliability) : undefined,
      hasDeliveries: raw.hasDeliveries === "1",
      sort:
        raw.sort === "deliveries" || raw.sort === "verified" || raw.sort === "name"
          ? raw.sort
          : "reliability",
      page,
    });
  } catch {
    error = "The registry could not be read. Seed the database and retry.";
  }

  const start = result ? (result.page - 1) * result.limit + (result.rows.length > 0 ? 1 : 0) : 0;
  const end = result ? (result.page - 1) * result.limit + result.rows.length : 0;
  const pages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading
          eyebrow="Discover"
          title="Verified entity registry"
          description="Search participants by county, category, ownership and evidenced delivery history."
          action={
            <div className="flex gap-2">
              <Button asChild variant={view === "grid" ? "default" : "outline"} size="sm">
                <Link href={mergeView(raw, "grid")}>
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </Link>
              </Button>
              <Button asChild variant={view === "table" ? "default" : "outline"} size="sm">
                <Link href={mergeView(raw, "table")}>
                  <TableIcon className="h-4 w-4" />
                  Table
                </Link>
              </Button>
            </div>
          }
        />

        {result ? (
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink-600">
            <span className="tabular-nums">{formatNumber(result.counters.entities)} entities</span>
            <span className="tabular-nums">
              {result.counters.entities
                ? Math.round((result.counters.verified / result.counters.entities) * 100)
                : 0}
              % verified
            </span>
            <span className="tabular-nums">{result.counters.counties} counties covered</span>
            <span className="tabular-nums">{formatNumber(result.counters.claims)} evidenced deliveries</span>
          </div>
        ) : null}

        <RegistryFilters />

        {error ? (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Registry unavailable</AlertTitle>
            <AlertDescription>
              {error}{" "}
              <Link href="/registry" className="underline">
                Retry
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {!result && !error ? <CardGridSkeleton count={9} /> : null}

        {result && result.rows.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={COPY.empty.registryFiltered.title}
            description={COPY.empty.registryFiltered.description.replace("{total}", "180")}
            action={
              <Button asChild>
                <Link href="/registry">Clear all filters</Link>
              </Button>
            }
          />
        ) : null}

        {result && result.rows.length > 0 && view === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.rows.map((entity) => (
              <EntityCard key={entity.id} entity={entity} variant="grid" />
            ))}
          </div>
        ) : null}

        {result && result.rows.length > 0 && view === "table" ? (
          <div className="mt-6">
            <RegistryTable
              rows={result.rows.map((entity) => ({
                slug: entity.slug,
                legalName: entity.legalName,
                category: ENTITY_CATEGORY_LABELS[entity.category],
                county: countyName(entity.countyCode),
                verification: entity.verification,
                reliability: entity.reliability,
                deliveries: entity._count.claims,
              }))}
            />
          </div>
        ) : null}

        {result && result.total > 0 ? (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-ink-600 md:flex-row">
            <p className="tabular-nums">
              Showing {start}–{end} of {result.total}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={mergePage(raw, page - 1)}>Previous</Link>
                </Button>
              ) : null}
              {page < pages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={mergePage(raw, page + 1)}>Next</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <p className="mt-4 text-xs text-ink-400">{PAGE_SIZE} per page.</p>
      </div>
    </PageFade>
  );
}

function mergeView(
  raw: Record<string, string | string[] | undefined>,
  view: string,
): string {
  const next = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === "string") next.set(key, value);
  });
  next.set("view", view);
  return `/registry?${next.toString()}`;
}

function mergePage(
  raw: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const next = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === "string") next.set(key, value);
  });
  next.set("page", String(page));
  return `/registry?${next.toString()}`;
}
