"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

type NavItem = { href: string; label: string };

export function SiteMobileMenu({
  items,
  isAuthed,
}: {
  items: NavItem[];
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/70 bg-card/70 text-foreground/80 hover:bg-brand-soft hover:text-brand-ink transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden h-dvh animate-slide-in-from-top">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border/70">
            <BrandMark size="sm" />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-foreground/80 hover:bg-brand-soft hover:text-brand-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
      )}
    </>
  );
}
