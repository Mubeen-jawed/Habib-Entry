"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  Calculator,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Pencil,
  Settings,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: string;
};

const DASHBOARD_ITEM: NavItem = {
  href: "/dashboard",
  label: "Dashboard",
  icon: Home,
};

const PRACTICE_ITEMS: NavItem[] = [
  { href: "/practice/math?school=dsse", label: "Math practice", icon: Calculator, match: "/practice/math" },
  { href: "/practice/reading", label: "English Reading practice", icon: BookOpen },
  { href: "/practice/writing", label: "English Writing practice", icon: Pencil },
  { href: "/dashboard#mocks", label: "Mock tests", icon: Timer, match: "/mock" },
];

const ESSAY_ITEMS: NavItem[] = [
  { href: "/essay", label: "Essay practice", icon: FileText },
];

const INTERVIEW_ITEMS: NavItem[] = [
  { href: "/interview", label: "Interview", icon: MessageSquare },
];

const META_ITEMS: NavItem[] = [];

const RESOURCES_ITEM: NavItem = {
  href: "/resources",
  label: "Resources",
  icon: BookOpenCheck,
};

const STORAGE_KEY = "dashboard-sidebar-collapsed";

function activenessScore(
  item: NavItem,
  pathname: string,
  search: string,
  hash: string
): number {
  if (item.match) {
    return pathname === item.match || pathname.startsWith(item.match + "/")
      ? 1
      : 0;
  }

  const [pathWithQuery, itemHash] = item.href.split("#");
  const [itemPath, itemQuery] = pathWithQuery.split("?");

  const pathMatches =
    itemPath === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === itemPath || pathname.startsWith(itemPath + "/");

  if (!pathMatches) return 0;

  let score = 1;

  if (itemQuery) {
    const itemParams = new URLSearchParams(itemQuery);
    const currentParams = new URLSearchParams(search);
    for (const [k, v] of itemParams.entries()) {
      if (currentParams.get(k) !== v) return 0;
      score += 10;
    }
  }

  if (itemHash) {
    if (hash !== "#" + itemHash) return 0;
    score += 10;
  }

  return score;
}

function getSectionActiveHref(
  items: NavItem[],
  pathname: string,
  search: string,
  hash: string
): string | null {
  let best: { href: string; score: number } | null = null;
  for (const item of items) {
    const score = activenessScore(item, pathname, search, hash);
    if (score > 0 && (!best || score > best.score)) {
      best = { href: item.href, score };
    }
  }
  return best?.href ?? null;
}

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

export function DashboardSidebar({
  user,
  signOutAction,
}: {
  user: { name: string | null; email: string | null };
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const hash = useHash();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const isCollapsed = mobileOpen ? false : collapsed;
  const closeMobile = () => setMobileOpen(false);

  const dashboardActiveHref = getSectionActiveHref(
    [DASHBOARD_ITEM],
    pathname,
    search,
    hash
  );
  const practiceActiveHref = getSectionActiveHref(
    PRACTICE_ITEMS,
    pathname,
    search,
    hash
  );
  const essayActiveHref = getSectionActiveHref(
    ESSAY_ITEMS,
    pathname,
    search,
    hash
  );
  const interviewActiveHref = getSectionActiveHref(
    INTERVIEW_ITEMS,
    pathname,
    search,
    hash
  );
  const resourcesActiveHref = getSectionActiveHref(
    [RESOURCES_ITEM],
    pathname,
    search,
    hash
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, hydrated]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, search, hash]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const firstName = user.name?.split(" ")[0] ?? "You";

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className={cn(
          "fixed top-3 left-3 z-40 p-2 rounded-md bg-card border border-border/70 shadow-sm text-foreground/80 hover:bg-brand-soft hover:text-brand-ink md:hidden",
          mobileOpen && "hidden"
        )}
      >
        <Menu className="w-5 h-5" />
      </button>
      <aside
        className={cn(
          "flex-col border-r border-border/70",
          mobileOpen
            ? "fixed inset-0 z-50 w-full h-screen bg-card flex"
            : "hidden",
          "md:sticky md:top-0 md:self-start md:h-screen md:shrink-0 md:flex md:inset-auto md:z-auto md:bg-card/40 md:backdrop-blur md:transition-[width] md:duration-200",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 px-3 border-b border-border/70",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && <BrandMark size="sm" />}
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) setMobileOpen(false);
              else setCollapsed((v) => !v);
            }}
            aria-label={
              mobileOpen
                ? "Close menu"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              mobileOpen ? "Close" : isCollapsed ? "Expand" : "Collapse"
            }
            className="p-1.5 rounded-md text-muted-foreground hover:bg-brand-soft hover:text-brand-ink transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-4">
          <ul className="space-y-0.5 px-2">
            <SidebarLink
              item={DASHBOARD_ITEM}
              active={dashboardActiveHref === DASHBOARD_ITEM.href}
              collapsed={isCollapsed}
              onNavigate={closeMobile}
            />
          </ul>
          <SidebarSection
            heading="Practice"
            items={PRACTICE_ITEMS}
            activeHref={practiceActiveHref}
            collapsed={isCollapsed}
            collapsible
            storageKey="dashboard-sidebar-section-practice"
            onNavigate={closeMobile}
          />
          <SidebarSection
            heading="Essay"
            items={ESSAY_ITEMS}
            activeHref={essayActiveHref}
            collapsed={isCollapsed}
            collapsible
            storageKey="dashboard-sidebar-section-essay"
            defaultCollapsed
            onNavigate={closeMobile}
          />
          <SidebarSection
            heading="Interview"
            items={INTERVIEW_ITEMS}
            activeHref={interviewActiveHref}
            collapsed={isCollapsed}
            collapsible
            storageKey="dashboard-sidebar-section-interview"
            defaultCollapsed
            onNavigate={closeMobile}
          />
          <SidebarSection
            heading="Meta-curricular"
            items={META_ITEMS}
            activeHref={null}
            collapsed={isCollapsed}
            collapsible
            storageKey="dashboard-sidebar-section-meta"
            defaultCollapsed
            emptyMessage="Coming soon"
            emptyIcon={Sparkles}
            onNavigate={closeMobile}
          />
          <ul className="space-y-0.5 px-2">
            <SidebarLink
              item={RESOURCES_ITEM}
              active={resourcesActiveHref === RESOURCES_ITEM.href}
              collapsed={isCollapsed}
              onNavigate={closeMobile}
            />
          </ul>
        </nav>

        <ProfileMenu
          user={user}
          firstName={firstName}
          collapsed={isCollapsed}
          signOutAction={signOutAction}
          onNavigate={closeMobile}
        />
      </aside>
    </>
  );
}

function ProfileMenu({
  user,
  firstName,
  collapsed,
  signOutAction,
  onNavigate,
}: {
  user: { name: string | null; email: string | null };
  firstName: string;
  collapsed: boolean;
  signOutAction: () => Promise<void>;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative border-t border-border/70 p-2"
    >
      {open && (
        <div
          className={cn(
            "absolute z-10 rounded-md border bg-card shadow-soft overflow-hidden",
            collapsed
              ? "left-full ml-2 bottom-2 w-52"
              : "left-2 right-2 bottom-full mb-2"
          )}
          role="menu"
        >
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-brand-soft hover:text-brand-ink"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>
          <form action={signOutAction} className="border-t border-border/70">
            <button
              type="submit"
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground/80 hover:bg-brand-soft hover:text-brand-ink"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? user.name ?? "Signed in" : undefined}
        className={cn(
          "flex items-center gap-3 w-full rounded-md p-2 text-left transition-colors",
          open ? "bg-brand-soft text-brand-ink" : "hover:bg-brand-soft",
          collapsed && "justify-center"
        )}
      >
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand text-brand-foreground text-sm font-semibold shrink-0">
          {(firstName[0] ?? "?").toUpperCase()}
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {user.name ?? "Signed in"}
              </div>
              {user.email && (
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              )}
            </div>
            <ChevronUp
              className={cn(
                "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                open ? "rotate-0" : "rotate-180"
              )}
            />
          </>
        )}
      </button>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          collapsed && "justify-center px-0",
          active
            ? "bg-brand-soft text-brand-ink font-medium"
            : "text-foreground/80 hover:bg-brand-soft hover:text-brand-ink"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </li>
  );
}

function SidebarSection({
  heading,
  items,
  activeHref,
  collapsed,
  collapsible = false,
  defaultCollapsed = false,
  storageKey,
  emptyMessage,
  emptyIcon,
  onNavigate,
}: {
  heading: string;
  items: NavItem[];
  activeHref: string | null;
  collapsed: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  storageKey?: string;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  const [sectionCollapsed, setSectionCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    if (!collapsible || !storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored === "1") setSectionCollapsed(true);
    else if (stored === "0") setSectionCollapsed(false);
  }, [collapsible, storageKey]);

  function toggleSection() {
    setSectionCollapsed((v) => {
      const next = !v;
      if (storageKey) localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }

  const hideItems = collapsible && !collapsed && sectionCollapsed;
  const EmptyIcon = emptyIcon;

  return (
    <div>
      {!collapsed &&
        (collapsible ? (
          <button
            type="button"
            onClick={toggleSection}
            aria-expanded={!sectionCollapsed}
            className="group flex items-center justify-between w-full px-4 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 hover:text-brand-ink font-medium"
          >
            <span>{heading}</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform",
                sectionCollapsed && "-rotate-90"
              )}
            />
          </button>
        ) : (
          <div className="px-4 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
            {heading}
          </div>
        ))}
      {!hideItems && items.length > 0 && (
        <ul className="space-y-0.5 px-2">
          {items.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={item.href === activeHref}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
      {!hideItems && items.length === 0 && !collapsed && emptyMessage && (
        <div className="px-4 py-1.5 text-xs text-muted-foreground/70 italic flex items-center gap-2">
          {EmptyIcon && <EmptyIcon className="w-3.5 h-3.5" />}
          <span>{emptyMessage}</span>
        </div>
      )}
    </div>
  );
}

