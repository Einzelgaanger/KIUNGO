import { NextResponse } from "next/server";
import { getEntityBySlug } from "@/lib/entities";
import { toPublicEntity } from "@/lib/public-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const entity = await getEntityBySlug(slug);
    if (!entity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const capability = Array.from(
      new Set(entity.claims.map((claim) => claim.contractLine.itemName)),
    );
    return NextResponse.json(toPublicEntity(entity, capability), {
      headers: {
        "Cache-Control": "public, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Registry unavailable" }, { status: 503 });
  }
}
