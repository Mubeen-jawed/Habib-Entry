"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function saveMockAnswer({
  attemptId,
  questionId,
  chosen,
  correct,
}: {
  attemptId: string;
  questionId: string;
  chosen: string;
  correct: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id) throw new Error("Not your attempt");
  if (attempt.mode !== "MOCK") throw new Error("Wrong attempt mode");
  if (attempt.submittedAt) throw new Error("Attempt already submitted");

  await db.answer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { chosen, correct },
    create: { attemptId, questionId, chosen, correct },
  });
}

export async function submitMockAttempt({ attemptId }: { attemptId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { answers: true, mockTest: { include: { items: true } } },
  });
  if (!attempt || attempt.userId !== session.user.id) throw new Error("Not your attempt");
  if (attempt.submittedAt) return;

  const total = attempt.mockTest?.items.length ?? attempt.answers.length;
  const score = attempt.answers.filter((a) => a.correct).length;

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      submittedAt: new Date(),
      score,
      totalQuestions: total,
    },
  });
}
