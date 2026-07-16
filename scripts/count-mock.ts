import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  const sections = await db.section.findMany();
  const perSection = await Promise.all(
    sections.map(async (s) => ({
      key: s.key,
      questions: await db.question.count({ where: { sectionId: s.id } }),
    })),
  );
  console.log("All questions:", perSection);
  const mockGroups = await db.mockTestQuestion.groupBy({
    by: ["sectionKey"],
    _count: { _all: true },
  });
  console.log("Mock questions:", mockGroups);
  await db.$disconnect();
}

main();
