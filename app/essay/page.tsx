import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EssayWriter } from "./EssayWriter";

export const metadata = { title: "Essay practice — HabibEntry" };

type SearchParams = Promise<{ open?: string }>;

export default async function EssayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { open } = await searchParams;

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

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-8">
        <BackButton className="mb-6" />
        <EssayWriter
          isSignedIn={Boolean(userId)}
          initialPreviewId={initialPreviewId}
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
      </main>
      <SiteFooter />
    </>
  );
}
