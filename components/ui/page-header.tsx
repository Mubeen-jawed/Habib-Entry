import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { ScribbleUnderline } from "./scribble";
import { toneText, type Tone } from "@/lib/tones";

export function PageHeader({
  eyebrow,
  eyebrowTone = "lavender",
  title,
  /** Optional accent word to underline with the signature scribble. */
  accent,
  description,
  actions,
  className,
  children,
}: {
  eyebrow?: React.ReactNode;
  eyebrowTone?: Tone;
  title: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" aria-hidden />
      <Container size="lg" className="py-14 md:py-20 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            {eyebrow && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  toneText[eyebrowTone]
                )}
              >
                <span className="w-6 h-px bg-current" />
                {eyebrow}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.02]">
              {title}
              {accent && (
                <>
                  {" "}
                  <span className="relative inline-block">
                    <span className="text-gradient-brand">{accent}</span>
                    <ScribbleUnderline />
                  </span>
                </>
              )}
            </h1>
            {description && (
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {children}
      </Container>
    </header>
  );
}
