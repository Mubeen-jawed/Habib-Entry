import { PrismaClient } from "@prisma/client";
import { isRenderableQuestion } from "../lib/sections";

const PER_SECTION = 25;

async function main() {
  const db = new PrismaClient();

  const mocks = await db.mockTest.findMany({ orderBy: { createdAt: "asc" } });
  if (mocks.length === 0) {
    console.log("No mock tests found. Run `pnpm db:seed` first.");
    await db.$disconnect();
    return;
  }
  const mock = mocks[0];
  console.log(`Rebuilding "${mock.title}" (${mock.id}) with ${PER_SECTION} q/section.`);

  await db.mockTestQuestion.deleteMany({ where: { mockTestId: mock.id } });

  const sections = await db.section.findMany();
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));

  for (const key of ["MATH", "READING", "WRITING"]) {
    const sec = byKey[key];
    if (!sec) {
      console.warn(`Section ${key} not found, skipping.`);
      continue;
    }
    const pool = (
      await db.question.findMany({
        where: { sectionId: sec.id, questionType: "MCQ" },
        orderBy: { difficulty: "asc" },
      })
    )
      .filter((q) =>
        isRenderableQuestion({
          questionType: q.questionType,
          choicesJson: q.choicesJson,
        }),
      )
      .slice(0, PER_SECTION);

    let order = 0;
    for (const q of pool) {
      await db.mockTestQuestion.create({
        data: {
          mockTestId: mock.id,
          questionId: q.id,
          sectionKey: key,
          order: order++,
        },
      });
    }
    console.log(`  ${key}: added ${pool.length} questions.`);
  }

  await db.mockTest.update({
    where: { id: mock.id },
    data: {
      description: `Full mock: ${PER_SECTION} Math + ${PER_SECTION} Reading + ${PER_SECTION} Writing + Essay, 3.5 hours total.`,
    },
  });

  await db.$disconnect();
  console.log("Done.");
}

main();
