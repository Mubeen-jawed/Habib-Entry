import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpenText, Calculator, ClipboardList, FileText, Pencil, Timer } from "lucide-react";

const SECTION_META: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; slug: string }> = {
  MATH: { name: "Math", icon: Calculator, slug: "math" },
  READING: { name: "Reading", icon: BookOpenText, slug: "reading" },
  WRITING: { name: "Writing", icon: Pencil, slug: "writing" },
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [sections, mockTests, recentAttempts, savedEssays] = await Promise.all([
    db.section.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { questions: true } } },
    }),
    db.mockTest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.attempt.findMany({
      where: { userId, submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: { mockTest: true },
    }),
    db.essay.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, prompt: true, wordCount: true, updatedAt: true },
    }),
  ]);

  // per-section attempted counts (unique questions attempted)
  const answered = await db.answer.findMany({
    where: { attempt: { userId } },
    include: { question: true },
  });
  const attemptedBySection = new Map<string, Set<string>>();
  for (const a of answered) {
    const key = (await keyForSection(a.question.sectionId)) ?? "?";
    if (!attemptedBySection.has(key)) attemptedBySection.set(key, new Set());
    attemptedBySection.get(key)!.add(a.questionId);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">Pick up where you left off.</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-3">
          {sections.map((s) => {
            const meta = SECTION_META[s.key];
            const Icon = meta?.icon ?? ClipboardList;
            const total = s._count.questions;
            const done = attemptedBySection.get(s.key)?.size ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center text-brand">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>{meta?.name ?? s.name}</CardTitle>
                      <CardDescription>{total} questions available</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{done}/{total} ({pct}%)</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                  <Button asChild variant="brand" className="w-full">
                    <Link href={`/practice/${meta?.slug ?? s.key.toLowerCase()}`}>
                      Practice {meta?.name ?? s.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center text-brand">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Timed mock tests</CardTitle>
                  <CardDescription>Full-length, section-timed simulations.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTests.length === 0 && (
                <p className="text-sm text-muted-foreground">No mocks available yet.</p>
              )}
              {mockTests.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    {m.description && (
                      <div className="text-sm text-muted-foreground">{m.description}</div>
                    )}
                  </div>
                  <Button asChild size="sm" variant="brand">
                    <Link href={`/mock/${m.id}`}>Start</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your last few attempts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAttempts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t completed any attempts yet.
                </p>
              )}
              {recentAttempts.map((a) => {
                const label =
                  a.mode === "MOCK"
                    ? a.mockTest?.title ?? "Mock test"
                    : `${SECTION_META[a.sectionKey ?? ""]?.name ?? a.sectionKey} practice`;
                return (
                  <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.submittedAt?.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {a.score ?? 0}/{a.totalQuestions ?? 0}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/attempts/${a.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {recentAttempts.length > 0 && (
                <div className="pt-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/attempts">View all attempts →</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 pb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center text-brand">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Your essays</CardTitle>
                    <CardDescription>
                      Drafts saved from the essay writer.
                    </CardDescription>
                  </div>
                </div>
                <Button asChild size="sm" variant="brand">
                  <Link href="/essay">Write essay</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedEssays.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t saved any essays yet.{" "}
                  <Link href="/essay" className="text-brand hover:underline">
                    Start one
                  </Link>
                  .
                </p>
              ) : (
                savedEssays.map((e) => (
                  <Link
                    key={e.id}
                    href={`/essay?open=${e.id}`}
                    className="flex items-start justify-between border rounded-md p-3 hover:bg-muted/40 transition-colors gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{e.prompt}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {e.wordCount} word{e.wordCount === 1 ? "" : "s"} · saved{" "}
                        {e.updatedAt.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-brand shrink-0 self-center">
                      Open →
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const sectionKeyCache = new Map<string, string | null>();
async function keyForSection(sectionId: string) {
  if (sectionKeyCache.has(sectionId)) return sectionKeyCache.get(sectionId) ?? null;
  const s = await db.section.findUnique({ where: { id: sectionId }, select: { key: true } });
  const key = s?.key ?? null;
  sectionKeyCache.set(sectionId, key);
  return key;
}
