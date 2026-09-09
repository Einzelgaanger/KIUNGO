"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="This view could not be loaded"
      description="Seed the database if it is empty, then retry. The demonstration never dead-ends."
      action={
        <Button onClick={reset} className="min-h-11">
          Retry
        </Button>
      }
    />
  );
}
