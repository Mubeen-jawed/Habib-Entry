import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({
  size = "lg",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: Size }) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-8", sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
