"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function submitPracticeAnswer({
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
  if (attempt.mode !== "PRACTICE") throw new Error("Wrong attempt mode");

  await db.answer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { chosen, correct },
    create: { attemptId, questionId, chosen, correct },
  });
}

export async function finishPracticeAttempt({ attemptId }: { attemptId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });
  if (!attempt || attempt.userId !== session.user.id) throw new Error("Not your attempt");

  const score = attempt.answers.filter((a) => a.correct).length;
  await db.attempt.update({
    where: { id: attemptId },
    data: {
      submittedAt: new Date(),
      score,
      totalQuestions: attempt.totalQuestions ?? attempt.answers.length,
    },
  });
}
