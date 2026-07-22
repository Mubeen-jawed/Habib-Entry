import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { DeleteMockButton } from "@/components/delete-mock-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Sticker } from "@/components/ui/sticker";
import { Sparkle } from "@/components/ui/scribble";
import { ArrowRight, ClipboardList, GraduationCap } from "lucide-react";
import { isRenderableQuestion } from "@/lib/sections";
import { createSampleMock } from "@/lib/mocks";
import type { Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { toneBg } from "@/lib/tones";
import { ESSAY_PROMPTS } from "@/app/essay/prompts";
import { SCHOOLS, type SchoolSlug } from "@/lib/schools";
import { isEffectiveAdmin } from "@/lib/admin-view";
import { ChangeSchoolButton } from "./ChangeSchoolButton";

const SECTION_META: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; slug: string; tone: Tone }> = {
  MATH:    { name: "Math",    icon: MathDoodleIcon,    slug: "math",    tone: "sky" },
  READING: { name: "Reading", icon: BookDoodleIcon,    slug: "reading", tone: "mint" },
  WRITING: { name: "Writing", icon: PencilDoodleIcon,  slug: "writing", tone: "pink" },
};

function MathDoodleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M5.5 3.7 h 13 c 0.6 0, 1 0.4, 1 1 v 15 c 0 0.6, -0.4 1, -1 1 h -13 c -0.6 0, -1 -0.4, -1 -1 v -15 c 0 -0.6, 0.4 -1, 1 -1 z" />
      <path d="M7 6.5 h 10 v 3 h -10 z" />
      <path d="M10.5 7.2 v 1.6 M 9.7 8 h 1.6" />
      <circle cx="8" cy="13" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="8" cy="19" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BookDoodleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 6.5 v 13" />
      <path d="M12 6.5 c -3 -1.2, -6 -1.2, -8.5 -0.1 v 12.4 c 2.5 -1.1, 5.5 -1.1, 8.5 0.1" />
      <path d="M12 6.5 c 3 -1.2, 6 -1.2, 8.5 -0.1 v 12.4 c -2.5 -1.1, -5.5 -1.1, -8.5 0.1" />
      <path d="M5 9.8 h 5" />
      <path d="M5 12.5 h 5" />
      <path d="M14 9.8 h 5" />
      <path d="M14 12.5 h 5" />
    </svg>
  );
}

function PencilDoodleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M17.2 3.4 l 3.5 3.5 -11.4 11.4 -4.5 1 1 -4.5 z" />
      <path d="M15.2 5.5 l 3.4 3.4" />
      <path d="M6 15.5 l 1.7 1.7" />
      <path d="M4.8 18.7 l 1.5 1.5" />
      <path d="M13.5 20 c 1 -0.6, 2 0.6, 3 0 s 2 -0.6, 3 0" />
    </svg>
  );
}

function ClockDoodleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <ellipse cx="12" cy="13.5" rx="8" ry="7.7" />
      <path d="M10.4 3.6 h 3.2" />
      <path d="M12 3.7 v 2" />
      <path d="M19.4 8 l 1.1 -1.1" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="16.7" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="7.3" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <path d="M12 13.5 l 0 -4" />
      <path d="M12 13.5 l 3 1.6" />
      <circle cx="12" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PenDoodleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M17.1 3.4 l 3.5 3.5 -9 9 -4.4 1 1 -4.4 z" />
      <path d="M15.2 5.5 l 3.4 3.4" />
      <path d="M8.6 13.6 l 1.7 1.7" />
      <path d="M3 20 c 1.2 -1.2, 2.4 0.8, 3.6 0 s 2.2 -1.1, 3.4 -0.1 s 2.3 0.5, 3.5 -0.4 s 2.3 0.7, 3.4 0.1" />
      <path d="M4.2 4.2 l 1.4 1.4 M 5.6 4.2 l -1.4 1.4" />
      <circle cx="19.4" cy="15.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    // Middleware should have caught this, but if the JWT can't be read here
    // (e.g. after a bad env change) don't blow up the render — send to login.
    redirect("/login");
  }
  const userId = session.user.id;
  const isAdmin = await isEffectiveAdmin();
  // Read the persisted school from DB so we always show the latest choice
  // even if the JWT hasn't refreshed yet.
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { schoolSlug: true },
  });
  const userSchoolSlug =
    dbUser?.schoolSlug === "dsse" || dbUser?.schoolSlug === "ahss"
      ? (dbUser.schoolSlug as SchoolSlug)
      : null;
  const userSchool = userSchoolSlug ? SCHOOLS[userSchoolSlug] : null;

  const [sections, mockTests, savedEssays, mockAttemptCount, inProgressMockAttempt] = await Promise.all([
    db.section.findMany({ orderBy: { order: "asc" } }),
    db.mockTest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.essay.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, prompt: true, wordCount: true, updatedAt: true },
    }),
    db.attempt.count({ where: { userId, mode: "MOCK" } }),
    db.attempt.findFirst({
      where: {
        userId,
        mode: "MOCK",
        submittedAt: null,
        mockTestId: { not: null },
      },
      orderBy: { startedAt: "desc" },
      include: { mockTest: true },
    }),
  ]);

  const latestMockId = mockTests[0]?.id;
  const hasStartedMock = mockAttemptCount > 0;
  const hasEssays = savedEssays.length > 0;

  const resumableMockAttempt = (() => {
    if (!inProgressMockAttempt || !inProgressMockAttempt.mockTest) return null;
    const totalTimeSeconds = inProgressMockAttempt.mockTest.totalTimeSeconds ?? 12600;
    const elapsed = Math.floor(
      (Date.now() - inProgressMockAttempt.startedAt.getTime()) / 1000,
    );
    if (!inProgressMockAttempt.essayPrompt) return null;
    if (elapsed >= totalTimeSeconds) return null;
    return inProgressMockAttempt;
  })();

  const randomPromptIdx = Math.floor(Math.random() * ESSAY_PROMPTS.length);
  const randomPrompt = ESSAY_PROMPTS[randomPromptIdx];

  const renderableCounts: Record<string, number> = {};
  for (const s of sections) {
    const qs = await db.question.findMany({
      where: {
        sectionId: s.id,
        questionType: "MCQ",
        // Math practice is DSSE-scoped, exclude AHSS-only questions from the count.
        ...(s.key === "MATH" ? { schoolSlug: { not: "ahss" } } : {}),
      },
      select: { questionType: true, choicesJson: true },
    });
    renderableCounts[s.key] = qs.filter(isRenderableQuestion).length;
  }

  const answered = await db.answer.findMany({
    where: { attempt: { userId } },
    include: { question: true },
  });
  const attemptedBySection = new Map<string, Set<string>>();
  for (const a of answered) {
    const key = (await keyForSection(a.question.sectionId)) ?? "?";
    if (!attemptedBySection.has(key)) attemptedBySection.set(key, new Set());
    attemptedBySection.get(key)!.add(a.questionId);
  }

  const firstName = session?.user?.name?.split(" ")[0];

  async function deleteMockAction(mockId: string) {
    "use server";
    const s = await auth();
    if (s?.user?.role !== "ADMIN") return;
    await db.mockTest.delete({ where: { id: mockId } });
    revalidatePath("/dashboard");
  }

  async function createSampleMockAction() {
    "use server";
    const s = await auth();
    if (s?.user?.role !== "ADMIN") return;
    await createSampleMock();
    revalidatePath("/dashboard");
  }

  return (
    <AppShell>
      <div>
        <PageHeader
          eyebrow="Dashboard"
          eyebrowTone="pink"
          title={<>Welcome{firstName ? `, ${firstName}` : ""}.</>}
          description={
            userSchool ? (
              <>
                You&apos;re preparing for{" "}
                <span className="font-medium text-foreground">
                  {userSchool.name}
                </span>
                . Pick up where you left off, practice a section, take a mock,
                or open an essay draft.
              </>
            ) : (
              "Pick up where you left off, practice a section, take a mock, or open an essay draft."
            )
          }
          actions={
            <div className="flex flex-col items-start md:items-end gap-2">
              {userSchool && userSchoolSlug && (
                <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-soft">
                  <GraduationCap className="w-4 h-4 text-brand-strong" />
                  <span className="text-muted-foreground">Applying to</span>
                  <span className="font-semibold">{userSchool.code}</span>
                  <ChangeSchoolButton
                    current={{
                      slug: userSchoolSlug,
                      code: userSchool.code,
                      name: userSchool.name,
                    }}
                    target={(() => {
                      const other: SchoolSlug =
                        userSchoolSlug === "dsse" ? "ahss" : "dsse";
                      const o = SCHOOLS[other];
                      return { slug: o.slug, code: o.code, name: o.name };
                    })()}
                  />
                </div>
              )}
              {/* <Sticker tone="mint" rotate={6}>
                <Sparkle color="currentColor" className="w-3 h-3" /> today&apos;s streak
              </Sticker> */}
            </div>
          }
        />


        <Section spacing="md">
          <div className="grid gap-6 md:grid-cols-3">
            {sections.map((s) => {
              const meta = SECTION_META[s.key];
              const Icon = meta?.icon ?? ClipboardList;
              const tone = meta?.tone ?? "lavender";
              const total = renderableCounts[s.key] ?? 0;
              const done = attemptedBySection.get(s.key)?.size ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const slug = meta?.slug ?? s.key.toLowerCase();
              return (
                <Card key={s.id} className="relative overflow-hidden">
                  <div className={cn("absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-70", toneBg[tone])} aria-hidden />
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8 text-brand-strong shrink-0" />
                      <div>
                        <CardTitle>{meta?.name ?? s.name}</CardTitle>
                        <CardDescription>{total} questions available</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">
                          {done}/{total} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="brand" className="flex-1 group">
                        <Link
                          href={
                            slug === "math"
                              ? `/practice/${slug}?school=${userSchoolSlug ?? "dsse"}`
                              : `/practice/${slug}`
                          }
                        >
                          <span className="inline-flex items-center">
                            Let&apos;s Go!
                            <span className="inline-flex overflow-hidden w-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover:w-4 group-hover:ml-1 group-hover:opacity-100 group-hover:translate-x-0">
                              <ArrowRight />
                            </span>
                          </span>
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/testing/${slug}`}>Test all</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section spacing="sm">
          <Card id="mocks" className="relative overflow-hidden scroll-mt-20">
            <div className={cn("absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-70", toneBg["lavender"])} aria-hidden />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <ClockDoodleIcon className="w-8 h-8 text-brand-strong shrink-0" />
                <div>
                  <CardTitle>Timed mock tests</CardTitle>
                  <CardDescription>
                    3.5-hour simulation: 25 questions each in Math, Reading, and
                    Writing, plus a timed Essay.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {resumableMockAttempt && resumableMockAttempt.mockTest && (
                <ListRow
                  title={
                    <span className="inline-flex items-center gap-2">
                      {resumableMockAttempt.mockTest.title}
                      <span className="text-[10px] uppercase tracking-wider text-brand-strong bg-brand-soft px-1.5 py-0.5 rounded">
                        In progress
                      </span>
                    </span>
                  }
                  hint={`Started ${resumableMockAttempt.startedAt.toLocaleString()}`}
                  action={
                    <div className="flex items-center gap-2">
                      {isAdmin && resumableMockAttempt.mockTestId && (
                        <DeleteMockButton
                          action={deleteMockAction.bind(
                            null,
                            resumableMockAttempt.mockTestId,
                          )}
                          title={resumableMockAttempt.mockTest.title}
                        />
                      )}
                      <Button asChild size="sm" variant="brand" className="group">
                        <Link href={`/mock/${resumableMockAttempt.mockTestId}`}>
                          <span className="inline-flex items-center">
                            Resume test
                            <span className="inline-flex overflow-hidden w-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover:w-4 group-hover:ml-1 group-hover:opacity-100 group-hover:translate-x-0">
                              <ArrowRight />
                            </span>
                          </span>
                        </Link>
                      </Button>
                    </div>
                  }
                />
              )}
              {mockTests.length === 0 ? (
                <EmptyState
                  title="No mocks yet"
                  description="New mock tests will show up here as they're added."
                  className="bg-transparent"
                  action={
                    isAdmin ? (
                      <form action={createSampleMockAction}>
                        <Button type="submit" size="sm" variant="brand">
                          Create sample mock
                        </Button>
                      </form>
                    ) : undefined
                  }
                />
              ) : !hasStartedMock && !resumableMockAttempt ? (
                <EmptyState
                  title="Ready for your first mock?"
                  className="bg-transparent"
                    action={
                    latestMockId ? (
                      <Button asChild size="sm" variant="brand" className="group">
                        <Link href={`/mock/${latestMockId}`}>
                          <span className="inline-flex items-center">
                            Let&apos;s Practice!
                            <span className="inline-flex overflow-hidden w-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover:w-4 group-hover:ml-1 group-hover:opacity-100 group-hover:translate-x-0">
                              <ArrowRight />
                            </span>
                          </span>
                        </Link>
                      </Button>
                    ) : undefined
                  }
                />
              ) : hasStartedMock ? (
                mockTests
                  .filter((m) => m.id !== resumableMockAttempt?.mockTestId)
                  .map((m) => (
                    <ListRow
                      key={m.id}
                      title={m.title}
                      hint={m.description ?? undefined}
                      action={
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <DeleteMockButton
                              action={deleteMockAction.bind(null, m.id)}
                              title={m.title}
                            />
                          )}
                          <Button asChild size="sm" variant="brand">
                            <Link href={`/mock/${m.id}`}>Start</Link>
                          </Button>
                        </div>
                      }
                    />
                  ))
              ) : null}
            </CardContent>
          </Card>
        </Section>

        <Section spacing="sm" className="pb-16">
          <Card className="relative overflow-hidden">
            <div className={cn("absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-70", toneBg["pink"])} aria-hidden />
            <CardHeader className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PenDoodleIcon className="w-8 h-8 text-brand-strong shrink-0" />
                  <div>
                    <CardTitle>Your essays</CardTitle>
                    <CardDescription>Drafts saved from the essay writer.</CardDescription>
                  </div>
                </div>
                {hasEssays && (
                  <Button asChild size="sm" variant="brand">
                  <Link href="/essay">
                   Practice essay
                  </Link>
                </Button>
                )}
               
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {savedEssays.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-xl border border-dashed p-8">
                  <div className="space-y-1">
                    <div className="font-medium">
                      Write about <span className="italic text-brand-strong">{randomPrompt}</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="brand" className="group">
                    <Link href={`/essay?prompt=${randomPromptIdx}`}>
                      <span className="inline-flex items-center">
                        Let&apos;s Write!
                        <span className="inline-flex overflow-hidden w-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover:w-4 group-hover:ml-1 group-hover:opacity-100 group-hover:translate-x-0">
                          <ArrowRight />
                        </span>
                      </span>
                    </Link>
                  </Button>
                </div>
              ) : (
                savedEssays.map((e) => (
                  <Link
                    key={e.id}
                    href={`/essay?open=${e.id}`}
                    className="flex items-start justify-between rounded-2xl border bg-card p-4 hover:bg-brand-soft transition-colors gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{e.prompt}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {e.wordCount} word{e.wordCount === 1 ? "" : "s"} · saved{" "}
                        {e.updatedAt.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-brand-strong shrink-0 self-center font-medium">
                      Open →
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </Section>
      </div>
    </AppShell>
  );
}

function ListRow({
  title,
  hint,
  action,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4 gap-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        {hint && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {hint}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

const sectionKeyCache = new Map<string, string | null>();
async function keyForSection(sectionId: string) {
  if (sectionKeyCache.has(sectionId)) return sectionKeyCache.get(sectionId) ?? null;
  const s = await db.section.findUnique({ where: { id: sectionId }, select: { key: true } });
  const key = s?.key ?? null;
  sectionKeyCache.set(sectionId, key);
  return key;
}
