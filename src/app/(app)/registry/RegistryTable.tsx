"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/kiungo/DataTable";
import { StatusBadge } from "@/components/kiungo/StatusBadge";
import type { VerificationStatus } from "@/types";

type Row = {
  slug: string;
  legalName: string;
  category: string;
  county: string;
  verification: VerificationStatus;
  reliability: number | null;
  deliveries: number;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "legalName",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/registry/${row.original.slug}`} className="font-medium text-ink-900">
        {row.original.legalName}
      </Link>
    ),
  },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "county", header: "County" },
  {
    accessorKey: "verification",
    header: "Verification",
    cell: ({ row }) => <StatusBadge status={row.original.verification} size="sm" />,
  },
  {
    accessorKey: "reliability",
    header: "Reliability",
    cell: ({ row }) => <span className="tabular-nums">{row.original.reliability ?? "—"}</span>,
  },
  {
    accessorKey: "deliveries",
    header: "Deliveries",
    cell: ({ row }) => <span className="tabular-nums">{row.original.deliveries}</span>,
  },
];

export function RegistryTable({ rows }: { rows: Row[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search this page" csvName="kiungo-registry.csv" />;
}
