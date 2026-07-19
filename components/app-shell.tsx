import { auth, signOut } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SiteFooter } from "@/components/site-footer";

export async function AppShell({
  children,
  contentClassName,
}: {
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex flex-1 min-h-0">
      <DashboardSidebar
        user={{
          name: session?.user?.name ?? null,
          email: session?.user?.email ?? null,
        }}
        signOutAction={signOutAction}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className={contentClassName ?? "flex-1"}>{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
