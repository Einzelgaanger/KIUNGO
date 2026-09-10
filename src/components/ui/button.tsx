import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-11 min-w-11 active:scale-[0.985]",
  {
    variants: {
      variant: {
        default: "rounded-2xl bg-[#0E1F1A] text-white hover:bg-[#1A3A2E] hover:shadow-md",
        accent: "rounded-2xl bg-[#D3F36B] text-[#0E1F1A] hover:bg-[#C5E85A]",
        outline:
          "rounded-2xl border border-[#0E1F1A]/10 bg-[#F7FAF6] text-[#0E1F1A] hover:bg-[#F4FBE3]",
        ghost: "rounded-2xl text-[#0E1F1A] hover:bg-[#F7FAF6]",
        destructive: "rounded-2xl bg-destructive text-white",
        warning: "rounded-2xl border border-[#F0C419] bg-[#FFF8E0] text-[#8A6A00]",
        dangerOutline: "rounded-2xl border border-red-200 bg-red-50 text-red-700",
        link: "text-[#0E1F1A] underline-offset-4 hover:underline min-h-0 min-w-0 h-auto px-0 font-semibold",
        dark: "rounded-2xl bg-[#D3F36B] text-[#0E1F1A] hover:bg-[#C5E85A]",
        darkGhost:
          "rounded-2xl border border-white/15 bg-transparent text-white hover:bg-white/10",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-3 text-xs min-h-9 min-w-9",
        lg: "h-12 px-6",
        xl: "h-14 px-6 text-base",
        icon: "h-11 w-11 p-0 rounded-2xl",
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
