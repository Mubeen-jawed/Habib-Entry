import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/tones";

// A tilted, hand-labeled sticker. The tilt is the creative flourish; the tile
// itself is monochrome (black type on card white with a thin border).
// The `tone` prop is accepted for API compatibility but ignored.
export function Sticker({
  rotate = -6,
  className,
  children,
}: {
  /** Accepted for backwards compatibility; ignored in the monochrome design. */
  tone?: Tone;
  /** Degrees. Negative = counter-clockwise. Keep within ±12 for readability. */
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-foreground/25 bg-card text-foreground px-3 py-1.5 text-xs font-semibold shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
