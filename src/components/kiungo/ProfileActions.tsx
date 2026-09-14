"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteToQuote } from "@/actions/registry";
import { InstantLink } from "@/components/kiungo/InstantLink";
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
import type { Role } from "@/types";

const CAN_SOURCE: Role[] = ["CONTRACTOR", "PROGRAMME", "FINANCIER", "ADMIN"];

export function ProfileActions({
  entityId,
  slug,
  name,
  role,
  ownFile,
}: {
  entityId: string;
  slug: string;
  name: string;
  role: Role;
  ownFile: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const shortlist = useShortlist();

  if (ownFile || !CAN_SOURCE.includes(role)) return null;

  const listed = shortlist.has(entityId);
  const item = { id: entityId, slug, name };

  return (
    <div className="grid gap-2">
      <Button onClick={() => setOpen(true)}>Invite to quote</Button>
      <Button
        variant="outline"
        onClick={() => {
          shortlist.toggle(item);
          toast.success(listed ? "Removed from shortlist" : "Added to shortlist");
        }}
      >
        {listed ? "Remove from shortlist" : "Add to shortlist"}
      </Button>
      {shortlist.items.length > 0 ? (
        <Button asChild variant="ghost">
          <InstantLink href="/shortlist">View shortlist ({shortlist.items.length})</InstantLink>
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite {name}</DialogTitle>
            <DialogDescription>
              Records a quote request and puts this file on your shortlist so you can keep comparing suppliers.
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
                    if (!listed) shortlist.toggle(item);
                    toast.success("Invite sent. They are on your shortlist.");
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
