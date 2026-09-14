"use client";

import { Logo } from "@/components/kiungo/Logo";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import type { Session } from "@/types";

export function MobileTopBar({ session }: { session: Session }) {
  return (
    <header className="glass-nav safe-pad-top safe-pad-x sticky top-0 z-30 flex h-14 items-center justify-between lg:hidden">
      <Logo href="/registry" compact />
      <RoleSwitcher
        currentUserId={session.userId}
        currentName={session.name}
        currentRole={session.role}
        currentEntity={session.entityName}
        compact
        tone="light"
      />
    </header>
  );
}
