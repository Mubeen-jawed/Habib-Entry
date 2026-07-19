import * as React from "react";
import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-soft", className)}>
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}
