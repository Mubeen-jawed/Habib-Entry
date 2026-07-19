import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { SiteNav } from "@/components/site-nav";
import { SiteMobileMenu } from "@/components/site-mobile-menu";
import { auth } from "@/auth";
import { isEffectiveAdmin } from "@/lib/admin-view";

const NAV = [
  { href: "/#schools", label: "Schools" },
  { href: "/schools/dsse", label: "DSSE" },
  { href: "/schools/ahss", label: "AHSS" },
  { href: "/essay", label: "Essay" },
  { href: "/interview", label: "Interview" },
];

const ADMIN_NAV = [
  { href: "/select-school", label: "Pick school" },
];

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = await isEffectiveAdmin();
  const navItems = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-3 md:gap-6">
        <BrandMark size="sm" />
        <SiteNav items={navItems} />
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {session?.user ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
          <SiteMobileMenu items={navItems} isAuthed={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
