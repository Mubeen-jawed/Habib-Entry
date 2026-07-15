"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function normalizeScore(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 2 || rounded > 8) return null;
  return rounded;
}

export async function saveEssay(input: {
  id?: string | null;
  prompt: string;
  text: string;
  readingScore?: number | null;
  analysisScore?: number | null;
  writingScore?: number | null;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false as const, error: "You must be signed in to save." };
  }

  const prompt = input.prompt.trim();
  const text = input.text;
  if (!prompt) return { ok: false as const, error: "Missing prompt." };
  if (!text.trim()) return { ok: false as const, error: "Nothing to save yet." };

  const wordCount = countWords(text);
  const readingScore = normalizeScore(input.readingScore);
  const analysisScore = normalizeScore(input.analysisScore);
  const writingScore = normalizeScore(input.writingScore);

  if (input.id) {
    const existing = await db.essay.findUnique({ where: { id: input.id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false as const, error: "Essay not found." };
    }
    const updated = await db.essay.update({
      where: { id: input.id },
      data: {
        prompt,
        text,
        wordCount,
        readingScore,
        analysisScore,
        writingScore,
      },
    });
    revalidatePath("/essay");
    return { ok: true as const, essay: updated };
  }

  const created = await db.essay.create({
    data: {
      userId,
      prompt,
      text,
      wordCount,
      readingScore,
      analysisScore,
      writingScore,
    },
  });
  revalidatePath("/essay");
  return { ok: true as const, essay: created };
}

export async function deleteEssay(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false as const, error: "Not signed in." };

  const essay = await db.essay.findUnique({ where: { id } });
  if (!essay || essay.userId !== userId) {
    return { ok: false as const, error: "Essay not found." };
  }
  await db.essay.delete({ where: { id } });
  revalidatePath("/essay");
  return { ok: true as const };
}
