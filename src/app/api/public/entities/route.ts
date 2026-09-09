import { NextResponse } from "next/server";
import { parseList, searchEntities } from "@/lib/entities";
import { toPublicEntity } from "@/lib/public-api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = await searchEntities({
      q: url.searchParams.get("q") ?? undefined,
      category: parseList(url.searchParams.get("category") ?? undefined),
      county: parseList(url.searchParams.get("county") ?? undefined),
      verification: parseList(url.searchParams.get("verification") ?? undefined),
      ownership: parseList(url.searchParams.get("ownership") ?? undefined),
      minReliability: url.searchParams.get("minReliability")
        ? Number(url.searchParams.get("minReliability"))
        : undefined,
      page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 24,
    });

    return NextResponse.json(
      {
        data: result.rows.map((row) => toPublicEntity(row)),
        meta: { page: result.page, limit: result.limit, total: result.total },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { data: [], meta: { page: 1, limit: 24, total: 0 } },
      { headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
