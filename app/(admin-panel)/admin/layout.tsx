import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { SiteFooter } from "@/components/site-footer";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, ClipboardList, Eye, LayoutDashboard, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/attempts", label: "Attempts", icon: ClipboardList },
  { href: "/admin/essays", label: "Essays", icon: FileText },
  { href: "/admin/visitors", label: "Visitors", icon: Eye },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              Habib<span className="text-brand">Entry</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" /> Back to app
              </Link>
            </Button>
            <span className="hidden md:inline text-sm text-muted-foreground">
              {session.user.name ?? session.user.email ?? "admin"}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">Sign out</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 flex gap-6 px-4 py-6">
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
