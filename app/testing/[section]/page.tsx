import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { db } from "@/lib/db";
import {
  SECTION_BY_SLUG,
  SECTION_NAMES,
  isRenderableQuestion,
  parseChoices,
} from "@/lib/sections";
import { BrowseRunner } from "./BrowseRunner";

type Params = Promise<{ section: string }>;

export default async function TestingSectionPage({
  params,
}: {
  params: Params;
}) {
  const { section: slug } = await params;
  const sectionKey = SECTION_BY_SLUG[slug];
  if (!sectionKey) notFound();

  const section = await db.section.findUnique({ where: { key: sectionKey } });
  if (!section) notFound();

  const raw = await db.question.findMany({
    where: { sectionId: section.id, questionType: "MCQ" },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
  });
  const questions = raw
    .filter(isRenderableQuestion)
    .map((q) => ({
      id: q.id,
      externalId: q.externalId,
      stem: q.stem,
      passage: q.passage,
      stemImageUrl: q.stemImageUrl,
      explanationImageUrl: q.explanationImageUrl,
      choices: parseChoices(q.choicesJson),
      correctChoice: q.correctChoice,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <BackButton className="mb-6" />
        <BrowseRunner
          sectionKey={sectionKey}
          sectionName={SECTION_NAMES[sectionKey]}
          questions={questions}
        />
      </div>
    </AppShell>
  );
}
