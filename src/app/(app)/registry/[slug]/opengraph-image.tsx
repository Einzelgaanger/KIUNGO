import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { ENTITY_CATEGORY_LABELS, countyName } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let name = slug;
  let category = "Entity";
  let county = "Kenya";
  let verified = "Registry";
  try {
    const entity = await prisma.entity.findUnique({ where: { slug } });
    if (entity) {
      name = entity.legalName;
      category = ENTITY_CATEGORY_LABELS[entity.category];
      county = countyName(entity.countyCode);
      verified = entity.verification === "VERIFIED" ? "Verified" : "Registry";
    }
  } catch {
    /* unseeded */
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "#0E1F1A",
          color: "white",
        }}
      >
        <div style={{ width: 36, height: 3, background: "#D3F36B" }} />
        <div style={{ marginTop: 24, fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#E7EEE9" }}>
          {verified} · {category} · {county}
        </div>
        <div style={{ marginTop: 16, fontSize: 64, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
        <div style={{ marginTop: 24, fontSize: 22, color: "#D3F36B" }}>Kiungo registry</div>
      </div>
    ),
    size,
  );
}
