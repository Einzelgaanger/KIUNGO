"use client";

import { usePathname } from "next/navigation";
import { MoreHorizontal, Plus, Search, LayoutDashboard, ClipboardCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { InstantLink } from "@/components/kiungo/InstantLink";
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
      <nav className="glass-tabbar safe-pad-bottom fixed inset-x-0 bottom-0 z-40 lg:hidden">
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
                  <InstantLink
                    href={tab.href}
                    aria-label={tab.label}
                    className="-mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D3F36B] text-[#0E1F1A] active:scale-95"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </InstantLink>
                </li>
              );
            }
            return (
              <li key={tab.href}>
                <InstantLink
                  href={tab.href}
                  className={cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-1 text-[10px] font-medium",
                    active ? "text-[#0E1F1A]" : "text-[#5A6B7D]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      active && "bg-[#D3F36B]/25",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  {tab.label}
                </InstantLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex min-h-[52px] w-full flex-col items-center justify-center gap-1 text-[10px] font-medium text-[#5A6B7D]"
            >
              <MoreHorizontal className="h-5 w-5" />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="left" className="w-[min(20rem,88vw)] border-0 bg-[#0E1F1A] text-white">
          <SheetHeader>
            <SheetTitle className="text-white">More</SheetTitle>
            <SheetDescription className="text-white/60">
              {session.name} · {countyName(session.countyCode)}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-1 py-4">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <InstantLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="sidebar-nav-link"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  {item.label}
                </InstantLink>
              );
            })}
            <InstantLink
              href="/whatsapp"
              onClick={() => setMoreOpen(false)}
              className="sidebar-nav-link"
              pendingLabel="Opening WhatsApp…"
            >
              WhatsApp demo
            </InstantLink>
            <InstantLink
              href="/build"
              onClick={() => setMoreOpen(false)}
              className="sidebar-nav-link"
            >
              I want to build a house
            </InstantLink>
          </div>
          <RoleSwitcher
            currentUserId={session.userId}
            currentName={session.name}
            currentRole={session.role}
            currentEntity={session.entityName}
            tone="dark"
          />
          <p className="mt-3 text-[11px] text-white/50">{COPY.landing.footerNote}</p>
        </SheetContent>
      </Sheet>
    </>
  );
}
