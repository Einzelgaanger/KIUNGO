import { prisma } from "@/lib/db";
import { nearestSite, type LatLng, type SiteResolution } from "@/lib/geo";

export async function resolveSiteAndReviewer(point: LatLng) {
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      lat: true,
      lng: true,
      geofenceM: true,
      nodeId: true,
    },
  });
  const resolution: SiteResolution | null = nearestSite(point, sites);
  if (!resolution) {
    return { resolution: null, reviewer: null };
  }

  let nodeId: string | null = resolution.site.nodeId;
  while (nodeId) {
    const reviewer = await prisma.user.findFirst({
      where: { nodeId, role: "REVIEWER" },
    });
    if (reviewer) {
      return { resolution, reviewer };
    }
    const node: { parentId: string | null } | null = await prisma.node.findUnique({
      where: { id: nodeId },
      select: { parentId: true },
    });
    nodeId = node?.parentId ?? null;
  }

  const fallback = await prisma.user.findFirst({
    where: { role: "REVIEWER" },
    orderBy: { name: "asc" },
  });
  return { resolution, reviewer: fallback };
}
