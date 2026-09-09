"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({ value }: { value: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast.success("Copied");
      }}
    >
      Copy
    </Button>
  );
}
