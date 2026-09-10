"use client";

import { rolesForPath } from "@/lib/constants";
import { UnauthorisedState } from "@/components/kiungo/UnauthorisedState";
import type { Session } from "@/types";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AuthGate({ session, children }: { session: Session; children: ReactNode }) {
  const pathname = usePathname();
  const allowed = rolesForPath(pathname);
  if (allowed !== "public" && !allowed.includes(session.role)) {
    return <UnauthorisedState session={session} />;
  }
  return children;
}
