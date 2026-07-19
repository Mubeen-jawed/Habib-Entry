import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/tones";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "w-9 h-9 rounded-lg [&_svg]:w-4 [&_svg]:h-4",
  md: "w-12 h-12 rounded-xl [&_svg]:w-5 [&_svg]:h-5",
  lg: "w-14 h-14 rounded-2xl [&_svg]:w-6 [&_svg]:h-6",
};

// Monochrome "stamped" icon tile. A black line-weight icon sits inside a
// neutral bordered tile, with an offset drop-shadow layer behind so the whole
// mark reads as a small printed stamp rather than a flat colored swatch.
// The `tone` prop is accepted for API compatibility but no longer produces
// visual variation.
export function IconTile({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  size?: Size;
  /** Accepted for backwards compatibility; ignored in the monochrome design. */
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-x-[3px] translate-y-[3px] bg-foreground/10",
          sizes[size]
        )}
      />
      <span
        className={cn(
          "relative flex items-center justify-center border border-foreground/30 bg-card text-foreground [&_svg]:stroke-[1.75]",
          sizes[size]
        )}
      >
        <Icon />
      </span>
    </span>
  );
}
