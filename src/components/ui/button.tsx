import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-11 min-w-11 md:min-h-10",
  {
    variants: {
      variant: {
        default: "bg-forest-900 text-white hover:bg-forest-800",
        accent: "bg-lime-500 text-forest-900 hover:bg-lime-600",
        outline:
          "border border-line bg-surface text-ink-900 hover:bg-forest-50",
        ghost: "text-ink-900 hover:bg-forest-50",
        destructive: "bg-clay-500 text-white hover:bg-clay-500/90",
        link: "text-forest-900 underline-offset-4 hover:underline min-h-0 min-w-0 h-auto px-0",
        dark: "bg-lime-500 text-forest-900 hover:bg-lime-600",
        darkGhost:
          "border border-forest-700 bg-transparent text-white hover:bg-forest-800",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs min-h-8 min-w-8",
        lg: "h-12 px-6",
        xl: "h-14 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
