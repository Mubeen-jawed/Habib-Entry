import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SECTION_NAMES, SectionKey } from "@/lib/sections";

export default async function AttemptsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const attempts = await db.attempt.findMany({
    where: { userId },
    orderBy: [{ submittedAt: "desc" }, { startedAt: "desc" }],
    include: { mockTest: true },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your attempts</h1>
          <p className="text-muted-foreground">Practice sessions and full mocks.</p>
        </div>

        {attempts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No attempts yet</CardTitle>
              <CardDescription>Start a practice session or a mock from your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="brand">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => {
              const isMock = a.mode === "MOCK";
              const label = isMock
                ? a.mockTest?.title ?? "Mock test"
                : `${SECTION_NAMES[(a.sectionKey ?? "") as SectionKey] ?? a.sectionKey} practice`;
              const total = a.totalQuestions ?? 0;
              const score = a.score ?? 0;
              return (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{label}</span>
                      <Badge variant={isMock ? "default" : "secondary"}>
                        {isMock ? "Mock" : "Practice"}
                      </Badge>
                      {!a.submittedAt && <Badge variant="warning">In progress</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Started {a.startedAt.toLocaleString()}
                      {a.submittedAt && ` · Submitted ${a.submittedAt.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.submittedAt && (
                      <Badge variant="outline">
                        {score}/{total}
                      </Badge>
                    )}
                    {a.submittedAt ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/attempts/${a.id}`}>Review</Link>
                      </Button>
                    ) : isMock && a.mockTestId ? (
                      <Button asChild size="sm" variant="brand">
                        <Link href={`/mock/${a.mockTestId}`}>Resume</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
