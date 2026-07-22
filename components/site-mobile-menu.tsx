"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const CLOSE_MS = 220;

export function SiteMobileMenu({
  items,
  isAuthed,
}: {
  items: NavItem[];
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closing = mounted && !open;
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const t = setTimeout(() => setMounted(false), CLOSE_MS);
    return () => clearTimeout(t);
  }, [open, mounted]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/70 bg-card/70 text-foreground/80 hover:bg-brand-soft hover:text-brand-ink transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mounted && (
        <>
          <div
            className={cn(
              "fixed inset-x-0 top-16 bottom-0 z-30 bg-foreground/20 md:hidden transition-opacity duration-200",
              closing ? "opacity-0" : "opacity-100"
            )}
            onClick={close}
            aria-hidden
          />
          <div
            className={cn(
              "fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-background border-b border-border/70 shadow-lg md:hidden",
              closing ? "animate-slide-out-to-top" : "animate-slide-in-from-top"
            )}
          >
            <nav className="px-4 py-3 space-y-1">
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={close}
                  className="block px-4 py-3 rounded-md text-base font-medium text-foreground/80 hover:bg-brand-soft hover:text-brand-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border/70 p-4 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {isAuthed ? (
                <Button variant="brand" size="lg" asChild className="w-full">
                  <Link href="/dashboard" onClick={close}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="lg" asChild className="w-full">
                    <Link href="/login" onClick={close}>
                      Sign in
                    </Link>
                  </Button>
                  <Button variant="brand" size="lg" asChild className="w-full">
                    <Link href="/register" onClick={close}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
