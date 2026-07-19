"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  const [path, hash] = href.split("#");
  if (hash) return pathname === "/" && path === "/";
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm rounded-full border border-border/70 bg-card/70 backdrop-blur px-1.5 py-1 shadow-soft">
      {items.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors",
              active
                ? "text-brand-ink bg-brand-soft"
                : "text-foreground/70 hover:text-brand-ink hover:bg-brand-soft"
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
