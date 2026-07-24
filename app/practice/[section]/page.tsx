import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SECTION_BY_SLUG, SECTION_NAMES, isRenderableQuestion } from "@/lib/sections";
import { SCHOOLS, type SchoolSlug } from "@/lib/schools";
import { pickMockCounts } from "@/lib/mock-counts";
import { PracticeRunner } from "./PracticeRunner";
import { AppShell } from "@/components/app-shell";

type Params = Promise<{ section: string }>;
type SearchParams = Promise<{ school?: string }>;

const KNOWN_SCHOOLS = new Set(["dsse", "ahss"]);

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { section: slug } = await params;
  const { school } = await searchParams;
  const sectionKey = SECTION_BY_SLUG[slug];
  if (!sectionKey) notFound();

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isSignedIn = Boolean(userId);

  const section = await db.section.findUnique({ where: { key: sectionKey } });
  if (!section) notFound();

  // Filter by school pool: questions tagged for this school + questions
  // available to all schools (schoolSlug=null). If no school param, no filter.
  const activeSchool = school && KNOWN_SCHOOLS.has(school) ? school : null;
  const activeSchoolMeta = activeSchool
    ? SCHOOLS[activeSchool as SchoolSlug]
    : null;
  const schoolFilter = activeSchool
    ? { OR: [{ schoolSlug: null }, { schoolSlug: activeSchool }] }
    : {};

  // Pick 20 or 25 questions per section attempt (Math: 20 or 25;
  // Reading/Writing: one gets 20 and the other 25).
  const targetCount = pickMockCounts()[sectionKey];

  // Look for an unfinished practice attempt to resume. Only signed-in users
  // have persisted attempts; guests resume from localStorage inside the runner.
  const resumeAttempt = userId
    ? await db.attempt.findFirst({
        where: {
          userId,
          mode: "PRACTICE",
          sectionKey,
          submittedAt: null,
          questionIdsJson: { not: null },
        },
        orderBy: { startedAt: "desc" },
        include: { answers: true },
      })
    : null;

  let resumeQuestionIds: string[] | null = null;
  if (resumeAttempt?.questionIdsJson) {
    try {
      const parsed = JSON.parse(resumeAttempt.questionIdsJson);
      if (
        Array.isArray(parsed) &&
        parsed.every((v: unknown) => typeof v === "string")
      ) {
        resumeQuestionIds = parsed;
      }
    } catch {
      // Fall through and treat as fresh.
    }
  }

  let questions;
  if (resumeQuestionIds && resumeQuestionIds.length > 0) {
    const rows = await db.question.findMany({
      where: { id: { in: resumeQuestionIds } },
    });
    const byId = new Map(rows.map((q) => [q.id, q]));
    questions = resumeQuestionIds
      .map((id) => byId.get(id))
      .filter((q): q is (typeof rows)[number] => Boolean(q))
      .filter(isRenderableQuestion);
  } else {
    // Exclude questions the user has already answered in prior finished
    // practice attempts, so fresh attempts progress through the pool.
    const answeredIds = userId
      ? (
          await db.answer.findMany({
            where: {
              attempt: { userId, mode: "PRACTICE", sectionKey },
            },
            select: { questionId: true },
          })
        ).map((r) => r.questionId)
      : [];

    const pool = (
      await db.question.findMany({
        where: {
          sectionId: section.id,
          id: { notIn: answeredIds },
          ...schoolFilter,
        },
        orderBy: { difficulty: "asc" },
      })
    ).filter(isRenderableQuestion);

    if (userId) {
      // Signed-in: keep difficulty order so progress is deterministic.
      questions = pool.slice(0, targetCount);
    } else {
      // Guest: shuffle so successive batches give a varied set.
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      questions = pool.slice(0, targetCount);
    }

    // If everything has been answered, cycle back through all.
    if (questions.length === 0) {
      const cyclePool = (
        await db.question.findMany({
          where: { sectionId: section.id, ...schoolFilter },
          orderBy: { difficulty: "asc" },
        })
      ).filter(isRenderableQuestion);
      if (!userId) {
        for (let i = cyclePool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cyclePool[i], cyclePool[j]] = [cyclePool[j], cyclePool[i]];
        }
      }
      questions = cyclePool.slice(0, targetCount);
    }
  }

  // Total renderable questions in this section, needed for the guest section
  // progress bar on the finished screen.
  const totalSectionQuestions = (
    await db.question.findMany({
      where: {
        sectionId: section.id,
        questionType: "MCQ",
        ...schoolFilter,
      },
      select: { questionType: true, choicesJson: true },
    })
  ).filter(isRenderableQuestion).length;

  const emptyState = (
    <div className="mx-auto max-w-5xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">
        No questions in {SECTION_NAMES[sectionKey]}
        {activeSchoolMeta ? ` for ${activeSchoolMeta.code}` : ""} yet.
      </h1>
      <p className="text-muted-foreground mt-2">
        Add content via the seed script or admin import.
      </p>
    </div>
  );

  if (questions.length === 0) {
    return (
      <AppShell guestCallbackUrl={`/practice/${slug}`}>{emptyState}</AppShell>
    );
  }

  // Reuse the unfinished attempt when resuming; otherwise create a fresh one
  // for signed-in users. Guests practise entirely client-side.
  let attempt = resumeAttempt;
  if (userId && !attempt) {
    attempt = await db.attempt.create({
      data: {
        userId,
        mode: "PRACTICE",
        sectionKey,
        totalQuestions: questions.length,
        questionIdsJson: JSON.stringify(questions.map((q) => q.id)),
      },
      include: { answers: true },
    });
  }

  // Compute resume position and running score from the attempt's stored
  // answers. The runner starts at the first question after the last answered
  // one in the fixed set.
  const answeredMap = new Map(
    (attempt?.answers ?? []).map((a) => [a.questionId, a]),
  );
  let initialIdx = 0;
  let initialCorrectSoFar = 0;
  for (let i = 0; i < questions.length; i++) {
    const a = answeredMap.get(questions[i].id);
    if (!a) break;
    initialIdx = i + 1;
    if (a.correct) initialCorrectSoFar += 1;
  }
  if (initialIdx > questions.length) initialIdx = questions.length;

  const runner = (
    <div className="mx-auto max-w-[1600px] px-4 pt-16 pb-8 md:py-8">
      <PracticeRunner
        attemptId={attempt?.id ?? ""}
        sectionKey={sectionKey}
        sectionName={SECTION_NAMES[sectionKey]}
        schoolCode={activeSchoolMeta?.code ?? null}
        schoolName={activeSchoolMeta?.name ?? null}
        totalSectionQuestions={totalSectionQuestions}
        isGuest={!isSignedIn}
        initialIdx={initialIdx}
        initialCorrectSoFar={initialCorrectSoFar}
        questions={questions.map((q) => ({
          id: q.id,
          stem: q.stem,
          passage: q.passage,
          stemImageUrl: q.stemImageUrl,
          explanationImageUrl: q.explanationImageUrl,
          questionType: q.questionType,
          choicesJson: q.choicesJson,
          correctChoice: q.correctChoice,
          explanation: q.explanation,
        }))}
      />
    </div>
  );

  return (
    <AppShell
      guestCallbackUrl={`/practice/${slug}`}
      guestMessage="Browsing as a guest, this attempt won't be saved. Sign in to track your practice."
    >
      {runner}
    </AppShell>
  );
}
