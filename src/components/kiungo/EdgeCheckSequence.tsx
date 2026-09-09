"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CHECKS = [
  "Location matched to site",
  "Photo timestamp valid",
  "Photo location matched device",
  "Quantity within contract balance",
];

export function EdgeCheckSequence({
  resolved,
}: {
  resolved: number;
}) {
  return (
    <ul className="space-y-2">
      {CHECKS.map((label, i) => {
        const done = i < resolved;
        return (
          <li key={label} className="flex min-h-11 items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border",
                done ? "border-lime-500 bg-lime-100 text-lime-700" : "border-line text-ink-400",
              )}
            >
              {done ? (
                <motion.span
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.span>
              ) : (
                <span className="h-3 w-3 animate-spin rounded-full border border-line border-t-ink-400" />
              )}
            </span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}
