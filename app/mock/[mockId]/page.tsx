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
  const userId = session?.user?.id ?? null;
  const isSignedIn = Boolean(userId);

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

  // Reuse an in-progress attempt for this mock only if it isn't stale. Guests
  // don't have persisted attempts, so they always start fresh with a random
  // essay prompt and the full timer.
  let attempt = userId
    ? await db.attempt.findFirst({
        where: { userId, mockTestId: mock.id, submittedAt: null },
        orderBy: { startedAt: "desc" },
      })
    : null;
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
  if (!attempt && userId) {
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

  const guestEssayPrompt =
    ESSAY_PROMPTS[Math.floor(Math.random() * ESSAY_PROMPTS.length)];

  // Preload existing answers for continuity. Guests always start empty.
  const existingAnswers = attempt
    ? await db.answer.findMany({ where: { attemptId: attempt.id } })
    : [];
  const answered = Object.fromEntries(
    existingAnswers.map((a) => [a.questionId, { chosen: a.chosen, correct: a.correct }])
  );

  const guestCallbackUrl = `/mock/${mockId}`;
  const guestMessage =
    "Browsing as a guest, this mock won't be saved. Sign in to keep a history and see per-question explanations.";

  if (mock.items.length === 0) {
    const empty = (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">This mock has no questions yet.</h1>
        <Button asChild variant="brand" className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
    return (
      <AppShell
        guestCallbackUrl={guestCallbackUrl}
        guestMessage={guestMessage}
      >
        {empty}
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

  // Elapsed seconds since the attempt started, used to resume the global
  // timer. Guests always get the full timer.
  const elapsedSeconds = attempt
    ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
    : 0;
  const remainingSeconds = Math.max(0, totalTimeSeconds - elapsedSeconds);

  const runner = (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
      <MockRunner
        attemptId={attempt?.id ?? ""}
        mockId={mock.id}
        sections={sectionMeta}
        questions={questions}
        initialAnswers={answered}
        essayPrompt={attempt?.essayPrompt ?? guestEssayPrompt}
        initialEssayText={attempt?.essayText ?? ""}
        remainingSeconds={remainingSeconds}
        isGuest={!isSignedIn}
      />
    </div>
  );

  return (
    <AppShell guestCallbackUrl={guestCallbackUrl} guestMessage={guestMessage}>
      {runner}
    </AppShell>
  );
}
