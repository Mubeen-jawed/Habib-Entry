"use client";

import { useTransition } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminViewMode } from "@/lib/admin-view";

export function AdminViewToggleButton({
  mode,
  toggleAction,
}: {
  mode: AdminViewMode;
  toggleAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const isAdminView = mode === "admin";
  const Icon = isAdminView ? Eye : ShieldCheck;
  const label = isAdminView ? "View as user" : "Back to admin";
  const hint = isAdminView ? "Admin view" : "User view";

  return (
    <form
      action={() => startTransition(() => toggleAction())}
      className="fixed bottom-4 right-4 z-50"
    >
      <button
        type="submit"
        disabled={pending}
        title={`${hint} — click to switch`}
        aria-label={label}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border pl-3 pr-4 py-2 text-sm font-medium shadow-pop transition-[transform,background-color]",
          "hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isAdminView
            ? "bg-foreground text-background border-foreground/30 hover:bg-foreground/90"
            : "bg-butter text-butter-ink border-butter-ink/30 hover:bg-butter/90",
          pending && "opacity-70 cursor-wait"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full",
            isAdminView ? "bg-background/15" : "bg-butter-ink/15"
          )}
          aria-hidden
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wider opacity-70">
            {hint}
          </span>
          <span>{label}</span>
        </span>
      </button>
    </form>
  );
}
