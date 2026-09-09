"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Plus, Search, LayoutDashboard, ClipboardCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import { isNavVisible, NAV_GROUPS } from "@/components/kiungo/nav";
import { COPY, countyName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileTabBar({ session }: { session: Session }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const showReview = session.role === "REVIEWER" || session.role === "PROGRAMME" || session.role === "ADMIN";
  const fourth = showReview
    ? { href: "/review", label: "Review", icon: ClipboardCheck }
    : { href: "/opportunities", label: "Opportunities", icon: Sparkles };

  const tabs = [
    { href: "/registry", label: "Registry", icon: Search },
    { href: "/console", label: "Console", icon: LayoutDashboard },
    { href: "/console/claims/new", label: "Submit", icon: Plus, fab: true },
    fourth,
  ];

  const moreItems = NAV_GROUPS.flatMap((group) =>
    group.items.filter((item) => isNavVisible(item, session.role)),
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid grid-cols-5 items-end">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.href === "/console"
                ? pathname === "/console" || pathname.startsWith("/console/claims")
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            if ("fab" in tab && tab.fab) {
              return (
                <li key={tab.href} className="flex justify-center">
                  <Link
                    href={tab.href}
                    aria-label={tab.label}
                    className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-lime-500 text-forest-900 shadow-md"
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]",
                    active ? "text-forest-900" : "text-ink-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] text-ink-400"
            >
              <MoreHorizontal className="h-5 w-5" />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
            <SheetDescription>
              {session.name} · {countyName(session.countyCode)}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-2 py-4">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm hover:bg-forest-50"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/whatsapp"
              onClick={() => setMoreOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-forest-900 hover:bg-forest-50"
            >
              Open WhatsApp demo
            </Link>
            <Link
              href="/build"
              onClick={() => setMoreOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm hover:bg-forest-50"
            >
              I want to build a house
            </Link>
          </div>
          <RoleSwitcher
            currentUserId={session.userId}
            currentName={session.name}
            currentRole={session.role}
            currentEntity={session.entityName}
            tone="light"
          />
          <p className="mt-3 text-xs text-ink-400">{COPY.landing.footerNote}</p>
        </SheetContent>
      </Sheet>
    </>
  );
}
