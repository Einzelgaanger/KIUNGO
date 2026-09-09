import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { withDb } from "@/lib/safe-db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.entityId) redirect("/registry");
  const entityId = session.entityId;
  const entity = await withDb(
    () => prisma.entity.findUnique({ where: { id: entityId } }),
    null,
  );
  if (!entity) redirect("/registry");
  redirect(`/registry/${entity.slug}`);
}
