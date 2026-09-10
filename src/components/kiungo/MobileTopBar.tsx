"use client";

import { Bell } from "lucide-react";
import { Logo } from "@/components/kiungo/Logo";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import type { Session } from "@/types";

export function MobileTopBar({ session }: { session: Session }) {
  return (
    <header className="glass-nav safe-pad-top safe-pad-x sticky top-0 z-30 flex h-14 items-center justify-between lg:hidden">
      <Logo href="/registry" compact />
      <div className="flex items-center gap-1">
        <span className="relative inline-flex h-11 w-11 items-center justify-center" aria-hidden>
          <Bell className="h-5 w-5 text-[#0E1F1A]" strokeWidth={1.75} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#F0C419]" />
        </span>
        <RoleSwitcher
          currentUserId={session.userId}
          currentName={session.name}
          currentRole={session.role}
          currentEntity={session.entityName}
          compact
          tone="light"
        />
      </div>
    </header>
  );
}
