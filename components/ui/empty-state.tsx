import * as React from "react";
import { cn } from "@/lib/utils";
import { IconTile } from "./icon-tile";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-3 rounded-xl border border-dashed bg-muted/40 p-8",
        className
      )}
    >
      {icon && <IconTile icon={icon} size="lg" tone="lavender" />}
      <div className="space-y-1">
        <div className="font-medium">{title}</div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
