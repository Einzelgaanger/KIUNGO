import type { ReactNode } from "react";

export function PageFade({ children }: { children: ReactNode }) {
  return <div className="portal-page">{children}</div>;
}
