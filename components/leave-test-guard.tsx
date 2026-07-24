"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// The attribute an on-page link/button can set to opt out of the guard —
// used by the runners' own "Save and exit" button so it doesn't retrigger
// the modal after already routing through the save flow.
export const NAV_GUARD_BYPASS_ATTR = "data-nav-guard-bypass";

// Module-scoped flag: once set, the guard's beforeunload handler stops
// firing so no browser "Leave site?" dialog appears. In-app exit paths
// (on-page Save-and-exit buttons, modal buttons, mock saveAndExit) route
// through leaveTestAndGoTo() below, which sets this flag before doing a
// hard navigation.
let hardExitInFlight = false;

export function leaveTestAndGoTo(url: string) {
  hardExitInFlight = true;
  window.location.href = url;
}

export function LeaveTestGuard({
  active,
  saveFn,
  discardFn,
}: {
  active: boolean;
  saveFn: () => Promise<void>;
  discardFn: () => Promise<void>;
}) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const bypassRef = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Intercept in-app anchor navigations so we can show the modal.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!activeRef.current || bypassRef.current) return;
      // Ignore modifier / non-primary clicks — those open new tabs.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute(NAV_GUARD_BYPASS_ATTR)) return;
      // Also honour the attribute on any wrapping element (e.g., a Button).
      if (target.closest(`[${NAV_GUARD_BYPASS_ATTR}]`)) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return; // same page, likely a hash / self link
      }

      e.preventDefault();
      e.stopPropagation();
      setPendingUrl(url.pathname + url.search + url.hash);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Native tab-close / refresh dialog — only fires for genuinely-external
  // hard navigations, since in-app exits go through leaveTestAndGoTo() and
  // set hardExitInFlight first.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!activeRef.current || bypassRef.current || hardExitInFlight) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const doNavigate = useCallback((url: string) => {
    bypassRef.current = true;
    // Hard navigation via leaveTestAndGoTo so the destination /dashboard
    // always refetches from the server and the beforeunload dialog stays
    // silent.
    leaveTestAndGoTo(url);
  }, []);

  const onSaveAndExit = useCallback(
    async (url: string) => {
      if (busy) return;
      setBusy(true);
      try {
        await saveFn();
      } catch {
        /* still navigate */
      }
      doNavigate(url);
    },
    [busy, saveFn, doNavigate],
  );

  const onExitWithoutSaving = useCallback(
    async (url: string) => {
      if (busy) return;
      setBusy(true);
      try {
        await discardFn();
      } catch {
        /* still navigate */
      }
      doNavigate(url);
    },
    [busy, discardFn, doNavigate],
  );

  if (!pendingUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-test-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        // Click outside the card dismisses (treated as "stay").
        if (e.target === e.currentTarget && !busy) setPendingUrl(null);
      }}
    >
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-lg p-6">
        <h2 id="leave-test-title" className="text-lg font-semibold">
          You&apos;re leaving this test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose whether to save your progress. If you exit without saving,
          this attempt will be discarded.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="brand"
            disabled={busy}
            onClick={() => onSaveAndExit(pendingUrl)}
          >
            {busy ? "Working…" : "Save and exit"}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onExitWithoutSaving(pendingUrl)}
          >
            Exit without saving
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => setPendingUrl(null)}
          >
            Stay on this test
          </Button>
        </div>
      </div>
    </div>
  );
}
