import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.entityId) redirect("/registry");
  const entity = await prisma.entity.findUnique({ where: { id: session.entityId } });
  if (!entity) redirect("/registry");
  redirect(`/registry/${entity.slug}`);
}
