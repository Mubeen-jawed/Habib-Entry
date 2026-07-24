import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { SubmitButton } from "@/components/submit-button";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{ error?: string }>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = params?.error;

  async function registerAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password || password.length < 8) {
      redirect(`/register?error=invalid`);
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      redirect(`/register?error=exists`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: { name: name || null, email, passwordHash },
    });

    await signIn("credentials", { email, password, redirectTo: "/select-school" });
  }

  const googleEnabled = !!process.env.AUTH_GOOGLE_ID;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start preparing for the Habib entry test.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "exists" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              An account with that email already exists.{" "}
              <Link className="underline" href="/login">Sign in instead</Link>.
            </div>
          )}
          {error === "invalid" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              Please enter a valid email and a password of at least 8 characters.
            </div>
          )}
          {googleEnabled && (
            <>
              <form
                action={async () => {
                  "use server";
                  // Land on /dashboard and let middleware handle onboarding:
                  // returning Google users go straight through, new users get
                  // bounced to /select-school with a proper callbackUrl. The
                  // old hardcoded "/select-school" here forced every Google
                  // sign-in, even returning users with a school already set,
                  // through the picker again.
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <GoogleSignInButton label="Sign up with Google" />
              </form>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <form action={registerAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" type="text" autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password (min 8 chars)</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <SubmitButton
              className="w-full"
              variant="brand"
              size="lg"
              loadingText="Creating account…"
            >
              Create account
            </SubmitButton>
          </form>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
