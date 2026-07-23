import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCHOOLS, SCHOOL_LIST, type TestComponent } from "@/lib/schools";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return SCHOOL_LIST.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const school = SCHOOLS[slug as keyof typeof SCHOOLS];
  if (!school) return { title: "School, Imtehan" };
  const isDsse = slug === "dsse";
  return {
    title: isDsse
      ? "Habib University DSSE entry test preparation — advanced math, essay, interview | Imtehan"
      : "Habib University AHSS entry test preparation — reading, writing, essay | Imtehan",
    description: isDsse
      ? "DSSE-specific Habib entry test preparation: Advanced Algebra & Functions, trigonometry, algebra, Accuplacer math practice, timed essay, and mock interviews."
      : "AHSS-specific Habib entry test preparation: reading, writing, Accuplacer English practice, Habib persuasive essay structure, and mock interviews.",
    alternates: { canonical: `/schools/${slug}` },
  };
}

export default async function SchoolDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const school = SCHOOLS[slug as keyof typeof SCHOOLS];
  if (!school) notFound();

  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const latestMock = isLoggedIn
    ? await db.mockTest.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })
    : null;
  const mockHref = isLoggedIn
    ? latestMock
      ? `/mock/${latestMock.id}`
      : "/dashboard#mocks"
    : "/register";
  const practiceHref = isLoggedIn ? "/dashboard" : "/register";

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className={cn("bg-gradient-to-b py-20 md:py-28", school.color)}>
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className={school.accent}>
                {school.code}
              </Badge>
              <Link href="/#schools" className="text-xs text-muted-foreground hover:underline">
                ← Back to schools
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance">
              {school.name}
            </h1>
            <p className="mt-4 text-muted-foreground text-lg md:text-xl">{school.tagline}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="brand" size="xl">
                <Link href={mockHref}>Start Mock test</Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href={practiceHref}>Practice single section</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12">
          <details className="group rounded-2xl border bg-card shadow-soft">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-6 md:p-7">
              <span className="text-lg font-semibold">See the content   </span>
              <span
                aria-hidden
                className="text-muted-foreground text-2xl leading-none transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-6 md:px-7 pb-7 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">School-specific component</h2>
                </div>
                <ComponentCard c={school.specific} accent={school.accent} highlight />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">English components</h2>
                </div>
                <div className="space-y-4">
                  {school.shared.map((c) => (
                    <ComponentCard key={c.key} c={c} accent={school.accent} />
                  ))}
                </div>
              </div>
            </div>
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ComponentCard({
  c,
  accent,
  highlight,
}: {
  c: TestComponent;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-2", highlight && accent, highlight && "border-current/40")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{c.name}</CardTitle>
          <span className="text-xs text-muted-foreground">{c.count}</span>
        </div>
        <CardDescription>{c.format}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          What&apos;s assessed
        </div>
        <ul className="space-y-1.5 text-sm">
          {c.skills.map((s) => (
            <li key={s} className="flex gap-2">
              <span className={cn("mt-2 w-1 h-1 rounded-full shrink-0 bg-current", accent)} />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
