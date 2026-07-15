import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SECTION_BY_SLUG, SECTION_NAMES } from "@/lib/sections";
import { PracticeRunner } from "./PracticeRunner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
  const schoolFilter = activeSchool
    ? { OR: [{ schoolSlug: null }, { schoolSlug: activeSchool }] }
    : {};

  // Pick up to 10 questions the user hasn't answered yet in a practice attempt.
  const answeredIds = (
    await db.answer.findMany({
      where: {
        attempt: { userId, mode: "PRACTICE", sectionKey },
      },
      select: { questionId: true },
    })
  ).map((r) => r.questionId);

  let questions = await db.question.findMany({
    where: {
      sectionId: section.id,
      id: { notIn: answeredIds },
      ...schoolFilter,
    },
    orderBy: { difficulty: "asc" },
    take: 10,
  });

  // If everything has been answered, cycle back through all.
  if (questions.length === 0) {
    questions = await db.question.findMany({
      where: { sectionId: section.id, ...schoolFilter },
      orderBy: { difficulty: "asc" },
      take: 10,
    });
  }

  if (questions.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">
            No questions in {SECTION_NAMES[sectionKey]} yet.
          </h1>
          <p className="text-muted-foreground mt-2">
            Add content via the seed script or admin import.
          </p>
        </main>
        <SiteFooter />
      </>
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
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-8">
        <PracticeRunner
          attemptId={attempt.id}
          sectionName={SECTION_NAMES[sectionKey]}
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
      </main>
      <SiteFooter />
    </>
  );
}
