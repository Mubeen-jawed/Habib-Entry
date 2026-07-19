import { notFound, redirect } from "next/navigation";
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
  const userId = session!.user.id;

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

  const answeredIds = (
    await db.answer.findMany({
      where: {
        attempt: { userId, mode: "PRACTICE", sectionKey },
      },
      select: { questionId: true },
    })
  ).map((r) => r.questionId);

  let questions = (
    await db.question.findMany({
      where: {
        sectionId: section.id,
        id: { notIn: answeredIds },
        ...schoolFilter,
      },
      orderBy: { difficulty: "asc" },
    })
  )
    .filter(isRenderableQuestion)
    .slice(0, targetCount);

  // If everything has been answered, cycle back through all.
  if (questions.length === 0) {
    questions = (
      await db.question.findMany({
        where: { sectionId: section.id, ...schoolFilter },
        orderBy: { difficulty: "asc" },
      })
    )
      .filter(isRenderableQuestion)
      .slice(0, targetCount);
  }

  if (questions.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">
            No questions in {SECTION_NAMES[sectionKey]}
            {activeSchoolMeta ? ` for ${activeSchoolMeta.code}` : ""} yet.
          </h1>
          <p className="text-muted-foreground mt-2">
            Add content via the seed script or admin import.
          </p>
        </div>
      </AppShell>
    );
  }

  // Create a new practice attempt when the user starts
  const attempt = await db.attempt.create({
    data: {
      userId,
      mode: "PRACTICE",
      sectionKey,
      totalQuestions: questions.length,
    },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <PracticeRunner
          attemptId={attempt.id}
          sectionKey={sectionKey}
          sectionName={SECTION_NAMES[sectionKey]}
          schoolCode={activeSchoolMeta?.code ?? null}
          schoolName={activeSchoolMeta?.name ?? null}
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
    </AppShell>
  );
}
