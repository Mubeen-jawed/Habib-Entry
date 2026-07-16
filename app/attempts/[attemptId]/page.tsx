import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { parseChoices, SECTION_NAMES, SectionKey } from "@/lib/sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Params = Promise<{ attemptId: string }>;

export default async function AttemptReviewPage({ params }: { params: Params }) {
  const { attemptId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      mockTest: true,
      answers: {
        include: {
          question: { include: { section: true } },
        },
        orderBy: { answeredAt: "asc" },
      },
    },
  });
  if (!attempt || attempt.userId !== userId) notFound();

  const label =
    attempt.mode === "MOCK"
      ? attempt.mockTest?.title ?? "Mock test"
      : `${SECTION_NAMES[(attempt.sectionKey ?? "") as SectionKey] ?? attempt.sectionKey} practice`;

  const total = attempt.totalQuestions ?? attempt.answers.length;
  const score = attempt.score ?? attempt.answers.filter((a) => a.correct).length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  // Per-section breakdown
  const bySection = new Map<string, { correct: number; total: number }>();
  for (const a of attempt.answers) {
    const key = a.question.section.key;
    const entry = bySection.get(key) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (a.correct) entry.correct += 1;
    bySection.set(key, entry);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {attempt.mode === "MOCK" ? "Mock test" : "Practice"} review
          </div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          {attempt.submittedAt && (
            <p className="text-sm text-muted-foreground">
              Submitted {attempt.submittedAt.toLocaleString()}
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
            <CardDescription>
              {score} correct out of {total} ({pct}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={pct} />
            {bySection.size > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {Array.from(bySection.entries()).map(([key, v]) => {
                  const sPct = Math.round((v.correct / v.total) * 100);
                  return (
                    <div key={key} className="rounded-md border p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {SECTION_NAMES[key as SectionKey] ?? key}
                      </div>
                      <div className="text-lg font-semibold">
                        {v.correct}/{v.total}
                      </div>
                      <div className="text-xs text-muted-foreground">{sPct}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {attempt.essayPrompt && (
          <Card>
            <CardHeader>
              <CardTitle>Essay</CardTitle>
              <CardDescription>{attempt.essayPrompt}</CardDescription>
            </CardHeader>
            <CardContent>
              {attempt.essayText ? (
                <div className="rounded-md border bg-background p-4 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                  {attempt.essayText}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No essay response was recorded for this attempt.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Question-by-question review</h2>
          <p className="text-sm text-muted-foreground">
            Click any question to expand the passage, options, and explanation.
          </p>
          {attempt.answers.map((a, i) => {
            const choices = parseChoices(a.question.choicesJson);
            const isSpr = a.question.questionType === "SPR";
            return (
              <details
                key={a.id}
                className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
              >
                <summary className="list-none cursor-pointer px-6 py-4 flex items-start gap-3 hover:bg-muted/40 transition-colors">
                  <span
                    aria-hidden
                    className="mt-1 inline-block w-2.5 text-muted-foreground transition-transform group-open:rotate-90"
                  >
                    ▶
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Q{i + 1} · {SECTION_NAMES[a.question.section.key as SectionKey] ?? a.question.section.key}
                      </div>
                      <Badge variant={a.correct ? "success" : "destructive"}>
                        {a.correct ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    {a.question.stem && (
                      <div className="text-base font-medium mt-1">{a.question.stem}</div>
                    )}
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 space-y-3 border-t bg-background">
                  {a.question.stemImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.question.stemImageUrl}
                      alt="Figure for the question"
                      className="rounded-md border bg-white max-h-[520px] w-auto"
                    />
                  )}
                  {a.question.passage && (
                    <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-line">
                      {a.question.passage}
                    </div>
                  )}
                  {isSpr ? (
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={cn("font-medium", a.correct ? "text-emerald-700" : "text-destructive")}>
                          {a.chosen || "(no answer)"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Correct answer: </span>
                        <span className="font-medium text-emerald-700">{a.question.correctChoice}</span>
                      </div>
                    </div>
                  ) : (
                    choices.map((c) => {
                      const isCorrect = c.id === a.question.correctChoice;
                      const isChosen = c.id === a.chosen;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "border rounded-md p-3 flex items-start gap-2",
                            isCorrect && "border-emerald-500 bg-emerald-50",
                            isChosen && !isCorrect && "border-destructive bg-destructive/10"
                          )}
                        >
                          <span className="font-medium">{c.id}.</span>
                          {c.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.imageUrl}
                              alt={`Choice ${c.id}`}
                              className="flex-1 max-h-32 w-auto bg-white"
                            />
                          ) : (
                            <span className="flex-1">{c.text}</span>
                          )}
                          {isCorrect && <span className="text-xs text-emerald-700 font-medium shrink-0">(correct)</span>}
                          {isChosen && !isCorrect && (
                            <span className="text-xs text-destructive font-medium shrink-0">(your answer)</span>
                          )}
                        </div>
                      );
                    })
                  )}
                  {a.question.explanationImageUrl && (
                    <div className="rounded-md bg-muted/40 p-3">
                      <div className="font-semibold mb-2 text-sm">Explanation</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.question.explanationImageUrl}
                        alt="Explanation"
                        className="w-full h-auto bg-white rounded"
                      />
                    </div>
                  )}
                  {!a.question.explanationImageUrl && a.question.explanation && (
                    <div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-line">
                      <div className="font-semibold mb-1">Explanation</div>
                      <div>{a.question.explanation}</div>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button asChild variant="ghost">
            <Link href="/attempts">← All attempts</Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
