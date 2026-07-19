import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/tones";

export function Chip({
  tone: _tone,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  /** Accepted for backwards compatibility; ignored in the monochrome design. */
  tone?: Tone;
}) {
  void _tone;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-card text-foreground px-3 py-1 text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
