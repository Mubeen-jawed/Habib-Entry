import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { parseChoices, SECTION_NAMES, SectionKey } from "@/lib/sections";
import { MockRunner } from "./MockRunner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

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

  // Reuse an in-progress attempt for this mock if it exists.
  let attempt = await db.attempt.findFirst({
    where: { userId, mockTestId: mock.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (!attempt) {
    attempt = await db.attempt.create({
      data: {
        userId,
        mockTestId: mock.id,
        mode: "MOCK",
        totalQuestions: mock.items.length,
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
      <>
        <SiteHeader />
        <main className="flex-1 mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">This mock has no questions yet.</h1>
          <Button asChild variant="brand" className="mt-4">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </main>
        <SiteFooter />
      </>
    );
  }

  const sectionMeta = mock.sections.map((s) => ({
    key: s.sectionKey as SectionKey,
    name: SECTION_NAMES[s.sectionKey as SectionKey] ?? s.sectionKey,
    timeSeconds: s.timeSeconds,
  }));

  const questions = mock.items.map((it) => ({
    id: it.question.id,
    sectionKey: it.sectionKey as SectionKey,
    stem: it.question.stem,
    passage: it.question.passage,
    choices: parseChoices(it.question.choicesJson),
    correctChoice: it.question.correctChoice,
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-8">
        <MockRunner
          attemptId={attempt.id}
          mockTitle={mock.title}
          sections={sectionMeta}
          questions={questions}
          initialAnswers={answered}
        />
      </main>
      <SiteFooter />
    </>
  );
}
