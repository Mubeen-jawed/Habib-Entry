import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  PenLine,
  Sparkles,
  Star,
} from "lucide-react";
import { SCHOOL_LIST, type School } from "@/lib/schools";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 md:px-8 pt-28 md:pt-36 pb-24 md:pb-32 text-center">
          <Badge variant="secondary" className="mb-8">
            <Sparkles className="w-3 h-3 mr-1" /> Built for Habib University applicants
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.1]">
            Prep smart for the{" "}
            <span className="text-brand">Habib entrance exam</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Two schools, two test patterns. Pick yours to see the exact components you&apos;ll be tested on
            and start practicing.
          </p>
        </section>

        {/* Schools */}
        <section id="schools" className="mx-auto max-w-6xl px-6 md:px-8 py-24 md:py-32">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Which school are you applying to?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Both schools share Reading, Writing, and the Essay. The math component differs.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {SCHOOL_LIST.map((s) => (
              <SchoolCard key={s.slug} school={s} />
            ))}
          </div>
        </section>

        {/* 5 admission components */}
        <section className="mx-auto max-w-6xl px-6 md:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              5 admission components
            </h2>
            <p className="mt-3 text-muted-foreground">What Habib evaluates.</p>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <ComponentTile icon={GraduationCap} title="Grades" body="Academic transcript" href="/grades" linkLabel="View scholarships" />
            <ComponentTile icon={ClipboardCheck} title="Test" body="Entrance exam" />
            <ComponentTile icon={MessageSquare} title="Interview" body="One-on-one" href="/interview" linkLabel="Book mock interview" />
            <ComponentTile icon={FileText} title="Essay" body="Written response" href="/essay" linkLabel="Practice essay" />
            <ComponentTile icon={Star} title="Meta-curricular" body="Beyond the classroom" />
          </div>
        </section>

        {/* Shared vs specific */}
        <section className="mx-auto max-w-6xl px-6 md:px-8 py-24 md:py-32">
          <Card>
            <CardHeader className="p-8 md:p-10">
              <CardTitle className="text-2xl">The Habib entrance exam at a glance</CardTitle>
              <CardDescription className="mt-2">
                A quick overview of what every applicant sits — and where the two schools differ.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3 p-8 md:p-10 pt-0">
              <MiniComponent
                icon={BookOpen}
                title="Accuplacer Reading"
                body="Shared. ~20–25 MCQs on information & ideas, rhetoric, synthesis, vocabulary."
                variant="shared"
              />
              <MiniComponent
                icon={PenLine}
                title="Accuplacer Writing + Essay"
                body="Shared. ~20–25 MCQs on grammar & style, plus one 350–500 word persuasive essay."
                variant="shared"
              />
              <MiniComponent
                icon={Calculator}
                title="Math (differs by school)"
                body="DSSE takes Advanced Level Math (algebra, functions, geometry, trig). AHSS takes Arithmetic (whole numbers, fractions, decimals, percent)."
                variant="specific"
              />
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 md:px-8 py-24 md:py-32">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Step n={1} title="Pick your school" body="DSSE for science/engineering. AHSS for arts, humanities & social sciences." />
            <Step n={2} title="Practice or mock" body="Warm up with untimed practice, or simulate the real test with a timed mock." />
            <Step n={3} title="Review and improve" body="Every attempt is saved with per-question explanations and per-section scores." />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 md:px-8 py-24 md:py-32">
          <Card className="bg-gradient-to-br from-brand/10 to-transparent border-brand/30">
            <CardContent className="p-12 md:p-16 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Ready when you are.</h3>
                <p className="text-muted-foreground mt-3">Free to start — no card required.</p>
              </div>
              <Button asChild size="xl" variant="brand">
                <Link href="/register">Create your account</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SchoolCard({ school }: { school: School }) {
  return (
    <Link href={`/schools/${school.slug}`} className="group">
      <Card
        className={cn(
          "h-full bg-gradient-to-br transition-colors border-2 hover:border-brand/40",
          school.color
        )}
      >
        <CardHeader className="p-8 md:p-10">
          <Badge variant="outline" className={cn("w-fit", school.accent)}>
            {school.code}
          </Badge>
          <CardTitle className="mt-5 text-xl md:text-2xl">{school.name}</CardTitle>
          <CardDescription className="mt-2">{school.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10 pt-0">
          <span className="inline-flex items-center text-sm font-medium text-brand group-hover:underline">
            View test details <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function MiniComponent({
  icon: Icon,
  title,
  body,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  variant: "shared" | "specific";
}) {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-md bg-brand/10 flex items-center justify-center text-brand">
          <Icon className="w-4 h-4" />
        </div>
        <div className="font-medium text-sm">{title}</div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      <Badge variant={variant === "shared" ? "secondary" : "warning"} className="mt-5">
        {variant === "shared" ? "Same for both schools" : "Differs by school"}
      </Badge>
    </div>
  );
}

function ComponentTile({
  icon: Icon,
  title,
  body,
  href = "#schools",
  linkLabel = "View schools",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-2">
      <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center text-brand">
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-medium text-sm">{title}</div>
      <p className="text-xs text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="text-xs font-medium text-brand hover:underline inline-flex items-center mt-1"
      >
        {linkLabel} <ArrowRight className="w-3 h-3 ml-0.5" />
      </Link>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-lg border p-8">
      <div className="w-10 h-10 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-semibold mb-5">
        {n}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
