import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { parseChoices, SECTION_NAMES, SectionKey, isRenderableQuestion } from "@/lib/sections";
import { ESSAY_PROMPTS } from "@/app/essay/prompts";
import { MockRunner } from "./MockRunner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

const DEFAULT_TOTAL_TIME_SECONDS = 3.5 * 60 * 60;

type Params = Promise<{ mockId: string }>;

export default async function MockPage({ params }: { params: Params }) {
  const { mockId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const mock = await db.mockTest.findUnique({
    where: { id: mockId },
    include: {
      sections: { orderBy: { order: "asc" } },
      items: {
        orderBy: [{ sectionKey: "asc" }, { order: "asc" }],
        include: { question: true },
      },
    },
  });
  if (!mock) notFound();

  const totalTimeSeconds =
    mock.totalTimeSeconds ?? DEFAULT_TOTAL_TIME_SECONDS;

  // Reuse an in-progress attempt for this mock only if it isn't stale.
  // Attempts predating the new flow (no essayPrompt) or past their time
  // budget get auto-submitted so the user starts fresh with a full timer.
  let attempt = await db.attempt.findFirst({
    where: { userId, mockTestId: mock.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (attempt) {
    const elapsed = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000,
    );
    const isStale = !attempt.essayPrompt || elapsed >= totalTimeSeconds;
    if (isStale) {
      await db.attempt.update({
        where: { id: attempt.id },
        data: { submittedAt: new Date() },
      });
      attempt = null;
    }
  }
  if (!attempt) {
    const essayPrompt =
      ESSAY_PROMPTS[Math.floor(Math.random() * ESSAY_PROMPTS.length)];
    attempt = await db.attempt.create({
      data: {
        userId,
        mockTestId: mock.id,
        mode: "MOCK",
        totalQuestions: mock.items.length,
        essayPrompt,
      },
    });
  }

  // Preload existing answers for continuity.
  const existingAnswers = await db.answer.findMany({
    where: { attemptId: attempt.id },
  });
  const answered = Object.fromEntries(
    existingAnswers.map((a) => [a.questionId, { chosen: a.chosen, correct: a.correct }])
  );

  if (mock.items.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">This mock has no questions yet.</h1>
          <Button asChild variant="brand" className="mt-4">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const sectionMeta = mock.sections.map((s) => ({
    key: s.sectionKey as SectionKey,
    name: SECTION_NAMES[s.sectionKey as SectionKey] ?? s.sectionKey,
  }));

  const questions = mock.items
    .filter((it) => it.question.questionType === "MCQ")
    .filter((it) =>
      isRenderableQuestion({
        questionType: it.question.questionType,
        choicesJson: it.question.choicesJson,
      }),
    )
    .map((it) => ({
      id: it.question.id,
      sectionKey: it.sectionKey as SectionKey,
      stem: it.question.stem,
      passage: it.question.passage,
      stemImageUrl: it.question.stemImageUrl,
      choices: parseChoices(it.question.choicesJson),
      correctChoice: it.question.correctChoice,
    }));

  // Elapsed seconds since the attempt started, used to resume the global timer.
  const elapsedSeconds = Math.floor(
    (Date.now() - attempt.startedAt.getTime()) / 1000,
  );
  const remainingSeconds = Math.max(0, totalTimeSeconds - elapsedSeconds);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <MockRunner
          attemptId={attempt.id}
          sections={sectionMeta}
          questions={questions}
          initialAnswers={answered}
          essayPrompt={attempt.essayPrompt ?? ""}
          initialEssayText={attempt.essayText ?? ""}
          remainingSeconds={remainingSeconds}
        />
      </div>
    </AppShell>
  );
}
