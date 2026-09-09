"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { FinanceProduct } from "@prisma/client";
import { applyForFinance } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COPY } from "@/lib/constants";
import { formatKes } from "@/lib/format";

export function FinanceApply({ product }: { product: FinanceProduct }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(product.minAmount);
  const [consent, setConsent] = useState(false);
  const [pending, start] = useTransition();
  const monthly = product.ratePctAnnual > 0 ? Math.round((amount * (product.ratePctAnnual / 100)) / 12) : 0;

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-xs text-ink-400">{product.providerName}</p>
      <h3 className="font-display text-base font-medium">{product.productName}</h3>
      <p className="mt-2 text-sm text-ink-600">{product.blurb}</p>
      <p className="mt-3 text-sm tabular-nums">
        {formatKes(product.minAmount)} – {formatKes(product.maxAmount)}
      </p>
      <Button className="mt-4" onClick={() => setOpen(true)}>
        Apply
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{product.productName}</DialogTitle>
            <DialogDescription>{product.providerName}</DialogDescription>
          </DialogHeader>
          <label className="text-sm">
            Amount
            <input
              type="range"
              className="mt-2 w-full"
              min={product.minAmount}
              max={product.maxAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <p className="tabular-nums">{formatKes(amount)}</p>
          {monthly > 0 ? (
            <p className="text-sm text-ink-600">Indicative monthly charge {formatKes(monthly)}</p>
          ) : null}
          <label className="flex items-start gap-2 text-sm text-ink-600">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
            {COPY.consent.replace("{provider}", product.providerName)}
          </label>
          <DialogFooter>
            <Button
              disabled={!consent || pending}
              onClick={() => {
                start(async () => {
                  const result = await applyForFinance({
                    productId: product.id,
                    amount,
                    consent: true,
                  });
                  if (result.ok) {
                    toast.success("Application submitted");
                    setOpen(false);
                  } else toast.error(result.error);
                });
              }}
            >
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
