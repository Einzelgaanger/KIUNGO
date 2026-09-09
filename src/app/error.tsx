"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-paper px-4 text-center">
      <div className="rounded-full bg-forest-100 p-4">
        <AlertTriangle className="h-6 w-6 text-forest-900" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-ink-600">
        Retry this page. If the database has not been seeded, run npx prisma db seed.
      </p>
      <Button className="mt-6 min-h-11" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
