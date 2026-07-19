import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "./icon-tile";
import { toneBg, toneText, type Tone } from "@/lib/tones";

// A pastel-tinted feature card. The whole card takes on the tone,
// background wash, icon tile, and CTA text. Optional `href` makes it
// clickable with lift + shadow.
export function TonedCard({
  tone = "lavender",
  icon,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  className,
  children,
  solid = false,
}: {
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
  children?: React.ReactNode;
  /** If true, use the pastel color as the card background instead of white. */
  solid?: boolean;
}) {
  const Wrapper: React.ElementType = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border/60 p-6 md:p-7 shadow-soft transition-all overflow-hidden",
        solid ? toneBg[tone] : "bg-card",
        href && "hover:shadow-pop hover:-translate-y-0.5",
        className
      )}
    >
      {/* Corner bloom */}
      <div
        aria-hidden
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-70 pointer-events-none",
          toneBg[tone]
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        {icon && <IconTile icon={icon} tone={tone} />}
        {eyebrow && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
              toneBg[tone],
              toneText[tone]
            )}
          >
            {eyebrow}
          </span>
        )}
      </div>
      <div className="relative space-y-1.5">
        <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="relative">{children}</div>}
      {href && linkLabel && (
        <div
          className={cn(
            "relative mt-auto pt-2 inline-flex items-center text-sm font-medium",
            toneText[tone]
          )}
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </Wrapper>
  );
}
