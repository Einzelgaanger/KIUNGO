"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { InstantLink } from "@/components/kiungo/InstantLink";
import { Logo } from "@/components/kiungo/Logo";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import { isActivePath, isNavVisible, NAV_GROUPS } from "@/components/kiungo/nav";
import { countyName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 hidden h-dvh shrink-0 flex-col p-3 lg:flex lg:w-[15.5rem] xl:w-64">
      <div className="sidebar-glass flex h-full flex-col">
        <div className="flex h-16 items-center px-4">
          <Logo href="/registry" tone="dark" />
        </div>
        <p className="px-4 pb-2 text-[11px] font-medium text-white/50">
          {session.role} · {countyName(session.countyCode)}
        </p>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => isNavVisible(item, session.role));
            if (items.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <InstantLink
                          href={item.href}
                          className={cn("sidebar-nav-link", active && "is-active")}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                          <span>{item.label}</span>
                        </InstantLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 p-3">
          <RoleSwitcher
            currentUserId={session.userId}
            currentName={session.name}
            currentRole={session.role}
            currentEntity={session.entityName}
          />
          <InstantLink
            href="/whatsapp"
            className="sidebar-nav-link"
            pendingLabel="Opening WhatsApp…"
          >
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
            WhatsApp demo
          </InstantLink>
        </div>
      </div>
    </aside>
  );
}
