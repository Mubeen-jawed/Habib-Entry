import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const db = new PrismaClient();

type Choice = { id: string; text: string; imageUrl?: string | null };

type SatQuestion = {
  externalId: string;
  sectionKey: string | null; // "READING" | "WRITING" | "MATH"
  schoolSlug?: string | null; // "dsse" | "ahss" | null (all)
  questionType?: string; // "MCQ" (default) | "SPR"
  domain: string | null;
  skill: string | null;
  difficulty: string | null;
  difficultyInt: number;
  passage?: string | null;
  stem: string;
  choices: Choice[];
  correctChoice: string | null;
  explanation?: string | null;
  hasChart?: boolean;
  stemImageUrl: string | null;
  explanationImageUrl?: string | null;
  sourcePage: number;
};

type SatFile = {
  sourcePdf: string;
  count: number;
  questions: SatQuestion[];
};

const SECTION_META: Record<string, { name: string; order: number }> = {
  MATH: { name: "Math", order: 0 },
  READING: { name: "English — Reading", order: 1 },
  WRITING: { name: "English — Writing", order: 2 },
};

async function ensureSection(key: string) {
  const meta = SECTION_META[key];
  if (!meta) throw new Error(`Unknown section key: ${key}`);
  return db.section.upsert({
    where: { key },
    update: { name: meta.name, order: meta.order },
    create: { key, name: meta.name, order: meta.order },
  });
}

async function main() {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.error("usage: tsx prisma/seed-sat.ts <path-to-json>");
    process.exit(2);
  }
  const jsonPath = resolve(process.cwd(), jsonArg);
  const data = JSON.parse(readFileSync(jsonPath, "utf-8")) as SatFile;

  console.log(`Loaded ${data.count} questions from ${data.sourcePdf}`);

  const sectionCache = new Map<string, string>();
  const topicCache = new Map<string, string>(); // key = `${sectionId}__${domain}`
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const q of data.questions) {
    const qType = q.questionType ?? "MCQ";
    // MCQ needs 4 choices; SPR has no choices at all.
    const choicesOk = qType === "SPR" ? q.choices.length === 0 : q.choices.length === 4;
    if (!q.sectionKey || !q.correctChoice || !choicesOk) {
      console.warn(
        `skip ${q.externalId}: sectionKey=${q.sectionKey} type=${qType} correct=${q.correctChoice} choices=${q.choices.length}`
      );
      skipped++;
      continue;
    }

    let sectionId = sectionCache.get(q.sectionKey);
    if (!sectionId) {
      const s = await ensureSection(q.sectionKey);
      sectionId = s.id;
      sectionCache.set(q.sectionKey, sectionId);
    }

    let topicId: string | null = null;
    if (q.domain) {
      const cacheKey = `${sectionId}__${q.domain}`;
      const cached = topicCache.get(cacheKey);
      if (cached) {
        topicId = cached;
      } else {
        const topic = await db.topic.upsert({
          where: { id: cacheKey },
          update: { name: q.domain },
          create: { id: cacheKey, sectionId, name: q.domain },
        });
        topicCache.set(cacheKey, topic.id);
        topicId = topic.id;
      }
    }

    const commonData = {
      sectionId,
      topicId,
      schoolSlug: q.schoolSlug ?? null,
      questionType: qType,
      domain: q.domain,
      skill: q.skill,
      passage: q.passage ?? null,
      stem: q.stem,
      choicesJson: JSON.stringify(q.choices),
      correctChoice: q.correctChoice,
      explanation: q.explanation ?? null,
      difficulty: q.difficultyInt,
      stemImageUrl: q.stemImageUrl,
      explanationImageUrl: q.explanationImageUrl ?? null,
    };
    const result = await db.question.upsert({
      where: { externalId: q.externalId },
      update: commonData,
      create: { externalId: q.externalId, ...commonData },
      select: { id: true, createdAt: true },
    });

    const isNew = Date.now() - result.createdAt.getTime() < 5_000;
    if (isNew) created++;
    else updated++;
  }

  console.log(`Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
