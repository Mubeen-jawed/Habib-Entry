import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          Habib<span className="text-brand">Entry</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/#schools" className="hover:text-foreground">Schools</Link>
          <Link href="/schools/dsse" className="hover:text-foreground">DSSE</Link>
          <Link href="/schools/ahss" className="hover:text-foreground">AHSS</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" size="sm" type="submit">Sign out</Button>
              </form>
            </>
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
      </div>
    </header>
  );
}
