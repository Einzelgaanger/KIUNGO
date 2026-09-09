"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ShortlistContextValue = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const value = useMemo<ShortlistContextValue>(
    () => ({
      ids,
      toggle: (id) =>
        setIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        ),
      has: (id) => ids.includes(id),
    }),
    [ids],
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
