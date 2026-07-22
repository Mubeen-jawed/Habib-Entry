import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { SignedOutPreview } from "@/components/signed-out-preview";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isEffectiveAdmin } from "@/lib/admin-view";
import { EssayWriter } from "./EssayWriter";
import { ESSAY_PROMPTS } from "./prompts";

export const metadata = { title: "Essay practice, Imtehan" };

type SearchParams = Promise<{ open?: string; prompt?: string; dialog?: string }>;

const VALID_DIALOGS = new Set(["tips", "rubric", "prompts"]);

export default async function EssayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return (
      <SignedOutPreview
        title="Essay practice"
        description="Draft your Habib admissions essay against real prompts and get instant AI feedback on reading, analysis, and writing so you know exactly what to sharpen before test day."
        callbackUrl="/essay"
      />
    );
  }

  const { open, prompt, dialog } = await searchParams;

  const parsedPromptIdx = prompt !== undefined ? Number(prompt) : NaN;
  const initialPromptIdx =
    Number.isInteger(parsedPromptIdx) &&
    parsedPromptIdx >= 0 &&
    parsedPromptIdx < ESSAY_PROMPTS.length
      ? parsedPromptIdx
      : null;

  const initialDialog =
    dialog && VALID_DIALOGS.has(dialog)
      ? (dialog as "tips" | "rubric" | "prompts")
      : null;

  const savedEssays = userId
    ? await db.essay.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          prompt: true,
          text: true,
          wordCount: true,
          readingScore: true,
          analysisScore: true,
          writingScore: true,
          updatedAt: true,
        },
      })
    : [];

  const initialPreviewId =
    open && savedEssays.some((e) => e.id === open) ? open : null;

  const isAdmin = await isEffectiveAdmin();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <BackButton className="mb-6" />
        <EssayWriter
          isSignedIn={Boolean(userId)}
          isAdmin={isAdmin}
          initialPreviewId={initialPreviewId}
          initialPromptIdx={initialPromptIdx}
          initialDialog={initialDialog}
          savedEssays={savedEssays.map((e) => ({
            id: e.id,
            prompt: e.prompt,
            text: e.text,
            wordCount: e.wordCount,
            readingScore: e.readingScore,
            analysisScore: e.analysisScore,
            writingScore: e.writingScore,
            updatedAt: e.updatedAt.toISOString(),
          }))}
        />
      </div>
    </AppShell>
  );
}
