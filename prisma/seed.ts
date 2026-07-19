import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Choice = { id: string; text: string };
type SeedQuestion = {
  topic?: string;
  passage?: string;
  stem: string;
  choices: Choice[];
  correct: string;
  explanation: string;
  difficulty?: number;
};

const MATH: SeedQuestion[] = [
  {
    topic: "Algebra",
    stem: "If 3x − 5 = 16, what is the value of x?",
    choices: [
      { id: "A", text: "5" },
      { id: "B", text: "6" },
      { id: "C", text: "7" },
      { id: "D", text: "8" },
    ],
    correct: "C",
    explanation: "3x = 21 → x = 7.",
    difficulty: 1,
  },
  {
    topic: "Algebra",
    stem: "A car travels 240 km in 4 hours. What is its average speed in km/h?",
    choices: [
      { id: "A", text: "40" },
      { id: "B", text: "50" },
      { id: "C", text: "60" },
      { id: "D", text: "70" },
    ],
    correct: "C",
    explanation: "Speed = distance / time = 240 / 4 = 60 km/h.",
    difficulty: 1,
  },
  {
    topic: "Geometry",
    stem: "The area of a rectangle is 48 sq units and its length is 8 units. What is its width?",
    choices: [
      { id: "A", text: "4" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "8" },
    ],
    correct: "C",
    explanation: "Width = area / length = 48 / 8 = 6.",
    difficulty: 1,
  },
  {
    topic: "Algebra",
    stem: "If f(x) = 2x² − 3x + 1, then f(2) = ?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "3" },
      { id: "C", text: "5" },
      { id: "D", text: "7" },
    ],
    correct: "B",
    explanation: "f(2) = 2·4 − 6 + 1 = 8 − 6 + 1 = 3.",
    difficulty: 2,
  },
  {
    topic: "Probability",
    stem: "A bag contains 3 red and 5 blue marbles. Probability of picking a red marble?",
    choices: [
      { id: "A", text: "3/8" },
      { id: "B", text: "5/8" },
      { id: "C", text: "3/5" },
      { id: "D", text: "1/2" },
    ],
    correct: "A",
    explanation: "P(red) = 3 / (3+5) = 3/8.",
    difficulty: 2,
  },
];

const READING: SeedQuestion[] = [
  {
    topic: "Main Idea",
    passage:
      "The invention of the printing press in the 15th century transformed the spread of knowledge. Before then, books were copied by hand and were rare and expensive. Movable type allowed identical copies to be produced quickly, dramatically lowering costs and enabling ideas to travel further and faster than ever before.",
    stem: "The primary purpose of the passage is to:",
    choices: [
      { id: "A", text: "argue that hand-copying was more accurate than printing." },
      { id: "B", text: "describe how printing changed the spread of knowledge." },
      { id: "C", text: "compare printing methods across different countries." },
      { id: "D", text: "explain the mechanics of movable type." },
    ],
    correct: "B",
    explanation:
      "The passage focuses on how the printing press transformed knowledge distribution, not on mechanics, methods, or an argument against hand-copying.",
    difficulty: 2,
  },
  {
    topic: "Inference",
    passage:
      "Coral reefs are among the most biodiverse ecosystems on Earth. Even a small change in ocean temperature can stress the corals, causing them to expel the algae living inside them and turn white, a process called bleaching. Repeated bleaching events can kill entire reefs.",
    stem: "It can be inferred from the passage that:",
    choices: [
      { id: "A", text: "coral reefs are unaffected by temperature." },
      { id: "B", text: "bleached corals are always dead." },
      { id: "C", text: "corals depend on algae to stay healthy." },
      { id: "D", text: "algae are harmful to corals." },
    ],
    correct: "C",
    explanation:
      "The passage says corals expel algae under stress and that this bleaching can kill them, implying corals rely on the algae in a healthy state.",
    difficulty: 2,
  },
  {
    topic: "Vocabulary in Context",
    passage:
      "The engineer's design was elegant, no wasted parts, no redundant lines. Every component served a purpose, and the whole assembly could be understood at a glance.",
    stem: "In the context above, 'elegant' most nearly means:",
    choices: [
      { id: "A", text: "expensive" },
      { id: "B", text: "efficient and clear" },
      { id: "C", text: "decorative" },
      { id: "D", text: "old-fashioned" },
    ],
    correct: "B",
    explanation:
      "'Elegant' here describes efficiency and clarity of purpose, not decoration or cost.",
    difficulty: 2,
  },
];

const WRITING: SeedQuestion[] = [
  {
    topic: "Grammar",
    stem: "Choose the option that best corrects the sentence: \"Each of the students have submitted their essay.\"",
    choices: [
      { id: "A", text: "Each of the students have submitted their essays." },
      { id: "B", text: "Each of the students has submitted their essay." },
      { id: "C", text: "Each of the student has submitted their essay." },
      { id: "D", text: "Each of the students had submit their essay." },
    ],
    correct: "B",
    explanation:
      "'Each' is singular, so the verb must be 'has,' not 'have.'",
    difficulty: 2,
  },
  {
    topic: "Punctuation",
    stem: "Which sentence is punctuated correctly?",
    choices: [
      { id: "A", text: "After the storm ended, the streets were flooded." },
      { id: "B", text: "After the storm ended the streets were flooded." },
      { id: "C", text: "After the storm, ended, the streets were flooded." },
      { id: "D", text: "After, the storm ended the streets were flooded." },
    ],
    correct: "A",
    explanation:
      "A comma is required after an introductory adverbial clause.",
    difficulty: 1,
  },
  {
    topic: "Concision",
    stem: "Choose the most concise version: \"Due to the fact that it was raining, the game was postponed.\"",
    choices: [
      { id: "A", text: "Due to the fact that it was raining, the game was postponed." },
      { id: "B", text: "Because it was raining, the game was postponed." },
      { id: "C", text: "Owing to the fact of the rain, the game was postponed." },
      { id: "D", text: "The game was postponed on account of the rain having occurred." },
    ],
    correct: "B",
    explanation:
      "'Because' expresses the same idea more concisely than 'due to the fact that.'",
    difficulty: 2,
  },
];

async function upsertSection(key: string, name: string, order: number) {
  return db.section.upsert({
    where: { key },
    update: { name, order },
    create: { key, name, order },
  });
}

async function seedQuestions(sectionKey: string, items: SeedQuestion[]) {
  const section = await db.section.findUniqueOrThrow({ where: { key: sectionKey } });
  const topicCache = new Map<string, string>();

  for (const q of items) {
    let topicId: string | null = null;
    if (q.topic) {
      const cached = topicCache.get(q.topic);
      if (cached) topicId = cached;
      else {
        const t = await db.topic.upsert({
          where: { id: `${section.id}__${q.topic}` },
          update: {},
          create: {
            id: `${section.id}__${q.topic}`,
            sectionId: section.id,
            name: q.topic,
          },
        });
        topicCache.set(q.topic, t.id);
        topicId = t.id;
      }
    }

    await db.question.create({
      data: {
        sectionId: section.id,
        topicId,
        passage: q.passage,
        stem: q.stem,
        choicesJson: JSON.stringify(q.choices),
        correctChoice: q.correct,
        explanation: q.explanation,
        difficulty: q.difficulty ?? 2,
      },
    });
  }
}

import { isRenderableQuestion } from "../lib/sections";
import { describeMockCounts, pickMockCounts } from "../lib/mock-counts";

async function seedMock() {
  const all = await db.question.findMany({ orderBy: { createdAt: "asc" } });
  const sections = await db.section.findMany();
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  const counts = pickMockCounts();

  const mock = await db.mockTest.create({
    data: {
      title: "Sample Full-Length Mock #1",
      description: describeMockCounts(counts),
    },
  });

  let sectionOrder = 0;
  for (const key of ["MATH", "READING", "WRITING"] as const) {
    const sectionId = byKey[key].id;
    await db.mockTestSection.create({
      data: {
        mockTestId: mock.id,
        sectionKey: key,
        order: sectionOrder++,
        timeSeconds: 0, // legacy field; global mock timer is used instead
      },
    });
    const pool = all
      .filter((q) => q.sectionId === sectionId && q.questionType === "MCQ")
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
}

async function main() {
  console.log("Seeding sections...");
  await upsertSection("MATH", "Math", 0);
  await upsertSection("READING", "English, Reading", 1);
  await upsertSection("WRITING", "English, Writing", 2);

  const existing = await db.question.count();
  if (existing > 0) {
    console.log(`Skipping question seed (${existing} questions already exist).`);
  } else {
    console.log("Seeding questions...");
    await seedQuestions("MATH", MATH);
    await seedQuestions("READING", READING);
    await seedQuestions("WRITING", WRITING);
  }

  const mockCount = await db.mockTest.count();
  if (mockCount === 0) {
    console.log("Seeding sample mock test...");
    await seedMock();
  } else {
    console.log(`Skipping mock seed (${mockCount} mock tests already exist).`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
