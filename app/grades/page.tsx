import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { auth } from "@/auth";
import { GraduationCap } from "lucide-react";
import { ScholarshipList } from "./ScholarshipList";

export const metadata = { title: "Grades & scholarships, Imtehan" };

function GradesContent({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {signedIn && <BackButton className="mb-6" />}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Admission component
        </div>
        <h1 className="text-2xl font-semibold flex items-center gap-2 mt-1">
          <GraduationCap className="w-6 h-6 text-brand" />
          Grades & scholarships
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your academic transcript is one of the five admission components Habib evaluates.
          Strong grades open the door to merit- and need-based financial support.
        </p>
      </div>

      <ScholarshipList />
    </div>
  );
}

export default async function GradesPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  if (!signedIn) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1">
          <GradesContent signedIn={false} />
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <AppShell>
      <GradesContent signedIn />
    </AppShell>
  );
}
