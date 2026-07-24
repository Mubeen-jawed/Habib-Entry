import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isEffectiveAdmin } from "@/lib/admin-view";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users } from "lucide-react";
import { InterviewForm } from "./InterviewForm";

export const metadata = {
  title: "Habib admission interview preparation, free mock interviews | Imtehan",
  description:
    "Free Habib admission interview preparation with current Habib students who have completed the real HU interview. Gender-matched, one-on-one, over video call.",
  alternates: { canonical: "/interview" },
};

const INTERVIEWERS = [
  { name: "Hashir", dept: "CE" },
  { name: "Mubeen", dept: "CE" },
  { name: "Emad", dept: "CE" },
  { name: "Haider", dept: "CnD" },
  { name: "Hasnain", dept: "EE" },
  { name: "Zain", dept: "EE" },
  { name: "Adiya", dept: "CS" },
  { name: "Tehriem", dept: "CnD" },
  { name: "Hoor", dept: "CS" },
  { name: "Zainab", dept: "CE" },
  { name: "Mahnoor", dept: "EE" },
  { name: "Khizer", dept: "CS" },
];

const GUIDELINES = [
  "You will be contacted within 12 hours after you submit this form.",
  "Mock interviews will take place only after your HU admission test.",
  "You can still submit this form before the test.",
  "Please submit this form only if your HU application is complete, your fee is paid, and you have your test date.",
  "Sessions will be scheduled on a first-come, first-served basis.",
  "The camera must be on during the interview.",
  "Join at least five minutes early.",
  "Be respectful and let the interviewer know beforehand if you need to reschedule.",
  "Your information will be shared only with your assigned interviewer.",
];

export default async function InterviewPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isSignedIn = Boolean(userId);

  const isAdmin = isSignedIn ? await isEffectiveAdmin() : false;

  let alreadySubmitted = false;
  if (userId && !isAdmin) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { interviewSubmittedAt: true },
    });
    alreadySubmitted = Boolean(user?.interviewSubmittedAt);
  }

  const body = (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackButton className="mb-6" />
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Free program
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1">
          Habib University Free Mock Interviews
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          The Habib University Free Mock Interview Program (by Habib&apos;s students) helps you
          practice, build confidence, and get familiar with the real HU interview process. All
          sessions are free and run by students who have already successfully completed the HU
          interview.
        </p>
      </div>
      <InterviewForm
        alreadySubmitted={alreadySubmitted}
        isAdmin={isAdmin}
        isGuest={!isSignedIn}
        intro={
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand" /> Interviewers (Gender-Based)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Boys will be interviewed by male interviewers, and girls by female interviewers. All
                  interviews will be one-on-one.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEWERS.map((i) => (
                    <Badge key={i.name} variant="secondary">
                      {i.name} <span className="ml-1 text-muted-foreground">({i.dept})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">Important Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5 leading-relaxed">
                  {GUIDELINES.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="mb-10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand" /> How it works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5 leading-relaxed">
                  <li>Fill out the form with accurate details.</li>
                  <li>We will reach out to you within 12 hours.</li>
                  <li>Your mock interview will be scheduled after your HU test.</li>
                  <li>Join on time, keep your camera on, and be ready.</li>
                </ol>
              </CardContent>
            </Card>

            <div className="mb-6">
              <h2 className="text-xl font-semibold">Sign up for a mock interview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fields marked <span className="text-destructive">*</span> are required.
              </p>
            </div>
          </>
        }
      />
    </div>
  );

  return (
    <AppShell
      guestCallbackUrl="/interview"
      guestMessage="Browsing as a guest, you'll need to sign in before submitting your interview booking."
    >
      {body}
    </AppShell>
  );
}
