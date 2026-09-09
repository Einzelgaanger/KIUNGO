"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/kiungo/Logo";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import { isActivePath, isNavVisible, NAV_GROUPS } from "@/components/kiungo/nav";
import { countyName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col bg-forest-900 text-white md:flex",
        "w-16 lg:w-[248px]",
      )}
    >
      <div className="flex h-16 items-center px-3 lg:px-5">
        <Logo href="/registry" tone="dark" compact className="lg:hidden" />
        <Logo href="/registry" tone="dark" className="hidden lg:inline-flex" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-3 lg:px-3">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => isNavVisible(item, session.role));
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="mb-2 hidden px-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-100/70 lg:block">
                {group.label}
              </p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
                          active
                            ? "border-l-2 border-lime-500 bg-forest-800 text-white"
                            : "border-l-2 border-transparent text-forest-100 hover:bg-forest-800",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden lg:inline">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-forest-700 p-2 lg:p-3">
        <p className="hidden px-1 text-[11px] text-forest-100/70 lg:block">
          County context · {countyName(session.countyCode)}
        </p>
        <div className="lg:hidden">
          <RoleSwitcher
            currentUserId={session.userId}
            currentName={session.name}
            currentRole={session.role}
            currentEntity={session.entityName}
            compact
          />
        </div>
        <div className="hidden lg:block">
          <RoleSwitcher
            currentUserId={session.userId}
            currentName={session.name}
            currentRole={session.role}
            currentEntity={session.entityName}
          />
        </div>
        <Link
          href="/whatsapp"
          className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm text-lime-500 hover:bg-forest-800 lg:flex"
        >
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp demo
        </Link>
      </div>
    </aside>
  );
}
