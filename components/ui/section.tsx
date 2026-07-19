import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { toneText, type Tone } from "@/lib/tones";

type Spacing = "sm" | "md" | "lg";

const spacings: Record<Spacing, string> = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
};

export function Section({
  spacing = "md",
  container = "lg",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  spacing?: Spacing;
  container?: "sm" | "md" | "lg" | "xl" | false;
}) {
  return (
    <section className={cn(spacings[spacing], className)} {...props}>
      {container ? <Container size={container}>{children}</Container> : children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowTone = "lavender",
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: React.ReactNode;
  eyebrowTone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16 space-y-4",
        align === "center" ? "text-center mx-auto max-w-2xl" : "",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
            toneText[eyebrowTone]
          )}
        >
          <span className="w-6 h-px bg-current" />
          {eyebrow}
          <span className="w-6 h-px bg-current" />
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
