import { cn } from "@/lib/utils";

// Hand-drawn scribble underline. Absolutely-positioned so it sits under a
// span of text, wrap the target text in `<span className="relative">…</span>`.
export function ScribbleUnderline({
  className,
  color = "currentColor",
  strokeWidth = 6,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className={cn(
        "absolute left-0 right-0 -bottom-1 md:-bottom-2 w-full h-3 md:h-4 pointer-events-none",
        className
      )}
    >
      <path
        d="M4 14 C 60 4, 130 22, 200 10 S 290 14, 296 10"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Small hand-drawn sparkle used as a recurring signature motif.
export function Sparkle({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("inline-block w-4 h-4", className)}
    >
      <path
        d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
        fill={color}
      />
    </svg>
  );
}

// Squiggle divider, a full-width wavy line for section breaks.
export function Squiggle({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      className={cn("w-full h-3", className)}
    >
      <path
        d="M0 6 Q 25 0, 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6 T 350 6 T 400 6"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
