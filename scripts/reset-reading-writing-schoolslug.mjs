import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const sections = await db.section.findMany({
  where: { key: { in: ["READING", "WRITING"] } },
  select: { id: true, key: true },
});

for (const s of sections) {
  const res = await db.question.updateMany({
    where: { sectionId: s.id, schoolSlug: { not: null } },
    data: { schoolSlug: null },
  });
  console.log(`${s.key}: reset ${res.count} question(s) to schoolSlug=null`);
}

await db.$disconnect();
