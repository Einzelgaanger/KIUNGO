import { AppSidebar } from "@/components/kiungo/AppSidebar";
import { MobileTabBar } from "@/components/kiungo/MobileTabBar";
import { UnauthorisedState } from "@/components/kiungo/UnauthorisedState";
import { rolesForPath } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? headerList.get("x-invoke-path") ?? "";
  const allowed = rolesForPath(pathname || "/registry");
  const authorised =
    allowed === "public" || allowed.includes(session.role);

  return (
    <div className="min-h-svh bg-paper text-ink-900">
      <div className="flex">
        <AppSidebar session={session} />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          {authorised ? children : <UnauthorisedState session={session} />}
        </div>
      </div>
      <MobileTabBar session={session} />
    </div>
  );
}
