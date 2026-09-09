import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-forest-100 text-forest-900",
        lime: "bg-lime-100 text-lime-700",
        gold: "bg-gold-100 text-gold-500",
        clay: "bg-clay-100 text-clay-500",
        sky: "bg-sky-100 text-sky-500",
        muted: "bg-line-soft text-ink-600",
        outline: "border border-line text-ink-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
