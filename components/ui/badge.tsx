import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-brand-foreground",
        secondary: "border-transparent bg-brand-soft text-brand-strong",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "border-border text-foreground bg-card",
        success: "border-transparent bg-muted text-foreground",
        warning: "border border-foreground/25 bg-card text-foreground",
        brand: "border-foreground/20 bg-muted text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
