import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ?? "/admin";
  const error = params?.error;

  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect(callbackUrl);

  async function loginAction(formData: FormData) {
    "use server";
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      await signIn("admin", {
        username,
        password,
        redirectTo: callbackUrl,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(
          `/admin/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Sign in to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "CredentialsSignin" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive-foreground p-3 text-sm">
              Invalid username or password.
            </div>
          )}
          <form action={loginAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" variant="brand" size="lg">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
