"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "imtehan.guest.banner.dismissedAt.v1";
const HIDE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export function GuestBanner({
  callbackUrl,
  className,
  message,
}: {
  callbackUrl: string;
  className?: string;
  message?: string;
}) {
  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const signInHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  // Start hidden so a dismissed banner never flashes on load; the mount check
  // reveals it if the 2-day window has elapsed (or was never set).
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const dismissedAt = Number.parseInt(raw, 10);
        if (
          Number.isFinite(dismissedAt) &&
          Date.now() - dismissedAt < HIDE_MS
        ) {
          setChecked(true);
          return;
        }
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
    setChecked(true);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // No-op; the banner is dismissed in-memory even if storage fails.
    }
  }

  if (!checked || !visible) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b bg-brand-soft/90 text-brand-strong backdrop-blur supports-[backdrop-filter]:bg-brand-soft/70",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <UserRound className="w-4 h-4 shrink-0" aria-hidden />
          <span className="truncate">
            {message ??
              "You're browsing as a guest, sign in to save your progress."}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={signInHref}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Sign in
          </Link>
          <Link
            href={registerHref}
            className="font-medium rounded-full bg-brand-strong text-white px-3 py-1 hover:bg-brand-strong/90"
          >
            Create account
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss guest banner"
            className="p-1 -mr-1 rounded-md text-brand-strong/70 hover:text-brand-strong hover:bg-brand-strong/10"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
