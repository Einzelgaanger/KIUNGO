"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ShortlistItem = { id: string; slug: string; name: string };

type ShortlistContextValue = {
  items: ShortlistItem[];
  toggle: (item: ShortlistItem) => void;
  has: (id: string) => boolean;
};

const STORAGE_KEY = "kiungo_shortlist";
const ShortlistContext = createContext<ShortlistContextValue | null>(null);

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ShortlistItem[];
        if (Array.isArray(parsed)) setItems(parsed.filter((row) => row?.id && row?.slug));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<ShortlistContextValue>(
    () => ({
      items,
      toggle: (item) =>
        setItems((current) =>
          current.some((row) => row.id === item.id)
            ? current.filter((row) => row.id !== item.id)
            : [...current, item],
        ),
      has: (id) => items.some((row) => row.id === id),
    }),
    [items],
  );
  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) {
    throw new Error("useShortlist must be used inside ShortlistProvider");
  }
  return ctx;
}
