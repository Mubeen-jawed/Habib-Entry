import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ?? "/dashboard";
  const error = params?.error;

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: callbackUrl,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw err;
    }
  }

  const googleEnabled = !!process.env.AUTH_GOOGLE_ID;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue your Habib entry test prep.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "CredentialsSignin" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive-foreground p-3 text-sm">
              Invalid email or password.
            </div>
          )}
          <form action={loginAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" variant="brand" size="lg">
              Sign in
            </Button>
          </form>

          {googleEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                Continue with Google
              </Button>
            </form>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
