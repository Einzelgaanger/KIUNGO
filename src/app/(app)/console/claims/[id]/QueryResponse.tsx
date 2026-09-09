"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { respondToQuery } from "@/actions/claims";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function QueryResponse({ claimId }: { claimId: string }) {
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="rounded-lg border border-gold-500/40 bg-gold-100 p-4">
      <h2 className="font-display text-base font-medium">Respond to query</h2>
      <Textarea
        className="mt-3"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Explain the resubmitted evidence"
      />
      <Button
        className="mt-3"
        disabled={pending || comment.length === 0}
        onClick={() => {
          start(async () => {
            const result = await respondToQuery({ claimId, comment });
            if (result.ok) {
              toast.success("Returned to the review queue");
              router.refresh();
            } else toast.error(result.error);
          });
        }}
      >
        Resubmit
      </Button>
    </div>
  );
}
