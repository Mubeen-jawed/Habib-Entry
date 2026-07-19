import { db } from "@/lib/db";
import { isRenderableQuestion } from "@/lib/sections";
import { describeMockCounts, pickMockCounts } from "@/lib/mock-counts";

export async function createSampleMock() {
  const [questions, sections, existingCount] = await Promise.all([
    db.question.findMany({ orderBy: { createdAt: "asc" } }),
    db.section.findMany(),
    db.mockTest.count(),
  ]);

  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  const nextNumber = existingCount + 1;
  const counts = pickMockCounts();

  const mock = await db.mockTest.create({
    data: {
      title: `Sample Full-Length Mock #${nextNumber}`,
      description: describeMockCounts(counts),
    },
  });

  let sectionOrder = 0;
  for (const key of ["MATH", "READING", "WRITING"] as const) {
    const section = byKey[key];
    if (!section) continue;
    await db.mockTestSection.create({
      data: {
        mockTestId: mock.id,
        sectionKey: key,
        order: sectionOrder++,
        timeSeconds: 0,
      },
    });
    const pool = questions
      .filter((q) => q.sectionId === section.id && q.questionType === "MCQ")
      .filter((q) =>
        isRenderableQuestion({
          questionType: q.questionType,
          choicesJson: q.choicesJson,
        }),
      )
      .slice(0, counts[key]);
    let qOrder = 0;
    for (const q of pool) {
      await db.mockTestQuestion.create({
        data: {
          mockTestId: mock.id,
          questionId: q.id,
          sectionKey: key,
          order: qOrder++,
        },
      });
    }
  }

  return mock;
}
