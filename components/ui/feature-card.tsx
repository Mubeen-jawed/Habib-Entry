import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "./icon-tile";

export function FeatureCard({
  icon,
  title,
  description,
  href,
  linkLabel,
  eyebrow,
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  eyebrow?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const Wrapper: React.ElementType = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 md:p-7 shadow-soft transition-all",
        href && "hover:shadow-pop hover:-translate-y-0.5 hover:border-brand/40",
        className
      )}
    >
      {icon && <IconTile icon={icon} size="md" />}
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </div>
        )}
        <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
      {href && linkLabel && (
        <div className="mt-auto pt-2 inline-flex items-center text-sm font-medium text-brand-strong">
          {linkLabel}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </Wrapper>
  );
}
