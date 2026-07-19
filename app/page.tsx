import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { TonedCard } from "@/components/ui/toned-card";
import { Chip } from "@/components/ui/chip";
import { IconTile } from "@/components/ui/icon-tile";
import { Sticker } from "@/components/ui/sticker";
import { ScribbleUnderline, Sparkle } from "@/components/ui/scribble";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  PenLine,
  Star,
} from "lucide-react";
import { SCHOOL_LIST, type School } from "@/lib/schools";
import { cn } from "@/lib/utils";
import { toneBg, toneText, type Tone } from "@/lib/tones";

const SCHOOL_TONES: Record<string, Tone> = {
  dsse: "sky",
  ahss: "peach",
};

const COMPONENTS: Array<{
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}> = [
  { tone: "sky",     icon: GraduationCap,   title: "Grades",           description: "Academic transcript",   href: "/grades",   linkLabel: "Scholarships" },
  { tone: "lavender",icon: ClipboardCheck,  title: "Test",             description: "Entrance exam",         href: "#schools",  linkLabel: "See patterns" },
  { tone: "mint",    icon: MessageSquare,   title: "Interview",        description: "One-on-one",            href: "/interview",linkLabel: "Book a mock" },
  { tone: "pink",    icon: FileText,        title: "Essay",            description: "Written response",      href: "/essay",    linkLabel: "Practice" },
  { tone: "peach",   icon: Star,            title: "Meta-curricular",  description: "Beyond the classroom",  href: "/eca",      linkLabel: "Get help" },
];

const STEPS: Array<{ n: number; tone: Tone; title: string; body: string }> = [
  { n: 1, tone: "lavender", title: "Pick your school", body: "DSSE for science/engineering. AHSS for arts, humanities & social sciences." },
  { n: 2, tone: "mint",     title: "Practice or mock", body: "Warm up with untimed practice, or simulate the real test with a timed mock." },
  { n: 3, tone: "peach",    title: "Review and improve", body: "Every attempt is saved with per-question explanations and per-section scores." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero, flat lavender + faint grid, Mojza-style. */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />

          {/* Scattered signature stickers, the memorable moment. */}
          <Sticker tone="pink" rotate={-8} className="hidden md:inline-flex absolute top-24 left-[8%] z-10">
            <Sparkle color="currentColor" className="w-3 h-3" /> new
          </Sticker>
          <Sticker tone="mint" rotate={7} className="hidden md:inline-flex absolute top-40 right-[10%] z-10">
            free to start
          </Sticker>
          <Sticker tone="butter" rotate={-4} className="hidden lg:inline-flex absolute bottom-32 left-[12%] z-10">
            2026 pattern
          </Sticker>

          <Container size="lg" className="relative pt-24 md:pt-32 pb-24 md:pb-36 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[0.98] animate-fade-in-up text-foreground">
              Practice all you got <br/>
              <span className="relative inline-block text-brand-strong">
                 for Habib
                <ScribbleUnderline color="#A89CF6" />
              </span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Crack the Habib Exam using the best resources shared by current students.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
              <Button asChild size="xl" variant="brand">
                <Link href="/register">
                  Start practicing <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="#schools">Explore schools</Link>
              </Button>
            </div>
            {/* <div className="mt-14 flex flex-wrap justify-center gap-2 text-xs">
              <Chip tone="mint">Free to start</Chip>
              <Chip tone="sky">Timed mock tests</Chip>
              <Chip tone="butter">Per-question explanations</Chip>
              <Chip tone="pink">Essay + interview prep</Chip>
            </div> */}
          </Container>
        </section>

        {/* Schools */}
        <Section spacing="lg" className="scroll-mt-20" id="schools">
          <SectionHeading
            eyebrow="Step one"
            eyebrowTone="sky"
            title="Which school are you applying to?"
            description="Both schools share Reading, Writing, and the Essay. Only the math component differs."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {SCHOOL_LIST.map((s) => (
              <SchoolCard key={s.slug} school={s} tone={SCHOOL_TONES[s.slug] ?? "lavender"} />
            ))}
          </div>
        </Section>

        {/* 5 admission components, each a different pastel */}
        <Section spacing="md">
          <SectionHeading
            eyebrow="What Habib evaluates"
            eyebrowTone="pink"
            title="5 admission components"
            description="Every applicant is reviewed across the same five areas."
          />
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {COMPONENTS.map((c) => (
              <TonedCard
                key={c.title}
                tone={c.tone}
                icon={c.icon}
                title={c.title}
                description={c.description}
                href={c.href}
                linkLabel={c.linkLabel}
              />
            ))}
          </div>
        </Section>

        {/* Exam at a glance */}
        <Section spacing="lg">
          <SectionHeading
            eyebrow="At a glance"
            eyebrowTone="mint"
            title="The Habib entrance exam"
            description="A quick overview of what every applicant sits, and where the two schools differ."
          />
          <div className="grid gap-6 md:grid-cols-3">
            <MiniComponent
              tone="mint"
              icon={BookOpen}
              title="Accuplacer Reading"
              body="Shared across both schools. ~20–25 MCQs on information & ideas, rhetoric, synthesis, and vocabulary."
              tag="Same for both"
            />
            <MiniComponent
              tone="pink"
              icon={PenLine}
              title="Accuplacer Writing + Essay"
              body="Shared. ~20–25 MCQs on grammar & style, plus one 350–500 word persuasive essay."
              tag="Same for both"
            />
            <MiniComponent
              tone="peach"
              icon={Calculator}
              title="Math"
              body="DSSE takes Advanced Level Math. AHSS takes Arithmetic (whole numbers, fractions, decimals, percent)."
              tag="Differs"
            />
          </div>
        </Section>

        {/* How it works */}
        <Section spacing="lg">
          <SectionHeading
            eyebrow="How it works"
            eyebrowTone="peach"
            title="Three steps to test-ready"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <Step key={s.n} {...s} />
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section spacing="lg">
          <div className="relative overflow-hidden rounded-3xl border p-10 md:p-16 shadow-soft bg-mesh-soft bg-card">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-pink blur-3xl opacity-70" aria-hidden />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-mint blur-3xl opacity-70" aria-hidden />
            <Sticker tone="butter" rotate={-8} className="absolute top-4 right-6 z-10">
              <Sparkle color="currentColor" className="w-3 h-3" /> no card required
            </Sticker>
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
              <div className="max-w-xl">
                <h3 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                  Ready when{" "}
                  <span className="relative inline-block">
                    you are.
                    <ScribbleUnderline color="#B4457A" />
                  </span>
                </h3>
                <p className="text-foreground/70 mt-4 text-lg">
                  Create an account and start with a free practice section.
                </p>
              </div>
              <Button asChild size="xl" variant="brand">
                <Link href="/register">
                  Create your account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function SchoolCard({ school, tone }: { school: School; tone: Tone }) {
  return (
    <Link
      href={`/schools/${school.slug}`}
      className="group relative flex flex-col gap-4 rounded-3xl border p-8 md:p-10 shadow-soft transition-all hover:shadow-pop hover:-translate-y-0.5 overflow-hidden bg-card"
    >
      <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-80 transition-opacity group-hover:opacity-100", toneBg[tone])} aria-hidden />
      <div className="relative flex items-center justify-between">
        <Chip tone={tone}>{school.code}</Chip>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          {school.slug}
        </span>
      </div>
      <div className="relative space-y-2">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
          {school.name}
        </h3>
        <p className="text-muted-foreground">{school.tagline}</p>
      </div>
      <div className={cn("relative mt-2 inline-flex items-center text-sm font-medium", toneText[tone])}>
        View test details
        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function MiniComponent({
  tone,
  icon,
  title,
  body,
  tag,
}: {
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 md:p-7 shadow-soft space-y-4">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} />
        <div className="font-semibold">{title}</div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      <Chip tone={tone}>{tag}</Chip>
    </div>
  );
}

function Step({ n, tone, title, body }: { n: number; tone: Tone; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-semibold mb-5 text-lg", toneBg[tone], toneText[tone])}>
        {n}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
