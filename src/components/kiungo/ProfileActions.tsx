"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteToQuote } from "@/actions/registry";
import { useShortlist } from "@/components/kiungo/ShortlistProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function ProfileActions({
  entityId,
  slug,
  name,
}: {
  entityId: string;
  slug: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const shortlist = useShortlist();

  return (
    <div className="grid gap-2">
      <Button onClick={() => setOpen(true)}>Invite to quote</Button>
      <Button
        variant="outline"
        onClick={() => {
          const exists = shortlist.has(entityId);
          shortlist.toggle(entityId);
          toast.success(exists ? "Removed from shortlist" : "Added to shortlist");
        }}
      >
        {shortlist.has(entityId) ? "Remove from shortlist" : "Add to shortlist"}
      </Button>
      <Button asChild variant="outline">
        <a href={`/api/public/entities/${slug}`}>Export profile as JSON</a>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite {name}</DialogTitle>
            <DialogDescription>
              This records an invitation in the demonstration. No message is sent.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            maxLength={400}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional note to the supplier"
          />
          <DialogFooter>
            <Button
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const result = await inviteToQuote({ entityId, message });
                  if (result.ok) {
                    toast.success("Invitation recorded");
                    setOpen(false);
                  } else {
                    toast.error(result.error);
                  }
                });
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
