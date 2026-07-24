"use server";

import { revalidatePath } from "next/cache";
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

  // Dashboard reflects live progress + resume state; invalidate its cache so
  // the next navigation shows the fresh answer count.
  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
}

// Discard an in-progress practice attempt. Used when the user opts to "Exit
// without saving" from the leave-test guard so the section resets on the
// dashboard. Safe to call for guests (attemptId="") — server-side no-op.
export async function discardPracticeAttempt({ attemptId }: { attemptId: string }) {
  if (!attemptId) return;
  const session = await auth();
  if (!session?.user?.id) return;

  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id) return;
  if (attempt.mode !== "PRACTICE") return;
  if (attempt.submittedAt) return;

  await db.attempt.delete({ where: { id: attemptId } });

  revalidatePath("/dashboard");
}
