"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-surface text-ink-900 border-line shadow-md rounded-md",
          description: "text-ink-600",
          actionButton: "bg-forest-900 text-white",
          cancelButton: "bg-forest-50 text-ink-900",
          success: "border-lime-500",
          error: "border-clay-500",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
