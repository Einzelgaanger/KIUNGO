import { AppSidebar } from "@/components/kiungo/AppSidebar";
import { AuthGate } from "@/components/kiungo/AuthGate";
import { MobileTabBar } from "@/components/kiungo/MobileTabBar";
import { MobileTopBar } from "@/components/kiungo/MobileTopBar";
import { NavProgress } from "@/components/kiungo/NavProgress";
import { isNavVisible, NAV_GROUPS } from "@/components/kiungo/nav";
import { PrefetchRoutes } from "@/components/kiungo/PrefetchRoutes";
import { ShortlistProvider } from "@/components/kiungo/ShortlistProvider";
import { PHOTOS } from "@/lib/brand";
import { getSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const prefetchHrefs = [
    ...NAV_GROUPS.flatMap((group) => group.items)
      .filter((item) => isNavVisible(item, session.role))
      .map((item) => item.href),
    "/whatsapp",
    "/build",
    "/console/claims/new",
  ];

  return (
    <div className="portal-shell">
      <NavProgress />
      <div className="portal-backdrop" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTOS.portal} alt="" className="portal-backdrop__photo" />
        <div className="portal-backdrop__veil" />
      </div>
      <div className="relative z-10 flex min-h-dvh">
        <AppSidebar session={session} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar session={session} />
          <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(var(--tab-bar-h)+var(--safe-bottom)+12px)] lg:pb-0">
            <div className="p-2 sm:p-3 lg:p-4">
              <div className="content-canvas p-2 sm:p-3">
                <ShortlistProvider>
                  <AuthGate session={session}>{children}</AuthGate>
                </ShortlistProvider>
              </div>
            </div>
          </main>
        </div>
      </div>
      <MobileTabBar session={session} />
      <PrefetchRoutes hrefs={prefetchHrefs} />
    </div>
  );
}
