"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PrefetchRoutes({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  const key = hrefs.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);

    function warm() {
      for (const href of list) {
        router.prefetch(href);
      }
    }

    warm();

    let idleId: number | undefined;
    let fallbackId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm);
    } else {
      fallbackId = window.setTimeout(warm, 200);
    }
    const again = window.setTimeout(warm, 1500);

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (fallbackId != null) window.clearTimeout(fallbackId);
      window.clearTimeout(again);
    };
  }, [key, router]);

  return null;
}
