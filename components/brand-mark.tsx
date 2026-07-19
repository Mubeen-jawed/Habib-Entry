import Link from "next/link";
import { cn } from "@/lib/utils";

// Signature monogram, a slightly tilted black chip with a white "H". The tilt
// is the creative flourish; no color or pictographs.
export function BrandMark({
  size = "md",
  href = "/",
  className,
  linked = true,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  linked?: boolean;
}) {
  const dims = {
    sm: { chip: "w-8 h-8 text-sm", text: "text-base" },
    md: { chip: "w-10 h-10 text-base", text: "text-lg" },
    lg: { chip: "w-14 h-14 text-2xl", text: "text-2xl" },
  }[size];

  const content = (
    <span className={cn("flex items-center gap-2.5 group", className)}>
      <span
        aria-hidden
        className={cn(
          "relative flex items-center justify-center font-semibold rounded-xl bg-brand text-brand-foreground shadow-soft transition-transform -rotate-6 group-hover:rotate-0",
          dims.chip
        )}
      >
        H
      </span>
      <span className={cn("font-semibold tracking-tight text-foreground", dims.text)}>
        Habib<span className="text-brand-strong">Entry</span>
      </span>
    </span>
  );

  if (!linked) return content;
  return (
    <Link href={href} aria-label="HabibEntry, home">
      {content}
    </Link>
  );
}
