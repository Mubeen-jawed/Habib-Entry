import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { SECTION_KEYS, SECTION_NAMES, SLUG_BY_SECTION, isRenderableQuestion } from "@/lib/sections";

export const metadata = { title: "Testing browser, HabibEntry" };

export default async function TestingIndex() {
  const sections = await db.section.findMany();
  const counts: Record<string, number> = {};
  for (const s of sections) {
    const qs = await db.question.findMany({
      where: { sectionId: s.id, questionType: "MCQ" },
      select: { questionType: true, choicesJson: true },
    });
    counts[s.key] = qs.filter(isRenderableQuestion).length;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <BackButton className="mb-6" />
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Testing
          </div>
          <h1 className="text-2xl font-semibold">Browse all questions by subject</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Walk through every MCQ in a subject. Use the chevron buttons or the
            ← / → keys to navigate. Answers aren&apos;t saved.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {SECTION_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base">{SECTION_NAMES[key]}</CardTitle>
                <CardDescription>
                  {counts[key] ?? 0} question{counts[key] === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/testing/${SLUG_BY_SECTION[key]}`}
                  className="text-sm text-brand hover:underline"
                >
                  Start browsing →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
