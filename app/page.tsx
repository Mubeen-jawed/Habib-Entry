import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { TonedCard } from "@/components/ui/toned-card";
import { Chip } from "@/components/ui/chip";
import { Sticker } from "@/components/ui/sticker";
import { ScribbleUnderline, Sparkle } from "@/components/ui/scribble";
import { ExamBySchoolToggle } from "@/components/exam-by-school-toggle";
import { SchoolCard } from "@/components/school-card";
import { RelatedPrepTopics } from "@/components/related-prep-topics";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  Star,
  Timer,
  TrendingUp,
} from "lucide-react";
import { SCHOOL_LIST } from "@/lib/schools";
import { cn } from "@/lib/utils";
import { toneBg, toneText, type Tone } from "@/lib/tones";

const SCHOOL_TONES: Record<string, Tone> = {
  dsse: "sky",
  ahss: "peach",
};

export const metadata: Metadata = {
  title: "Habib entry test preparation — free mocks, essay & interview | Imtehan",
  description:
    "Imtehan is the free resource for the Habib University entry test: full-length Accuplacer mock tests, per-section practice for DSSE and AHSS, essay writing practice, and one-on-one mock interviews with current Habib students.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Habib entry test preparation — free mocks, essay & interview | Imtehan",
    description:
      "Free Habib University entry test preparation for DSSE and AHSS applicants — Accuplacer mocks, essay practice, and mock interviews.",
  },
};

const COMPONENTS: Array<{
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}> = [
  { tone: "sky",     icon: GraduationCap,   title: "Eligibility",      description: "Academic transcript",   href: "/grades",   linkLabel: "Scholarships" },
  { tone: "lavender",icon: ClipboardCheck,  title: "Test",             description: "Entrance exam",         href: "/test",     linkLabel: "See patterns" },
  { tone: "mint",    icon: MessageSquare,   title: "Interview",        description: "One-on-one",            href: "/interview",linkLabel: "Book a mock" },
  { tone: "pink",    icon: FileText,        title: "Essay",            description: "Written response",      href: "/essay",    linkLabel: "Practice" },
  { tone: "peach",   icon: Star,            title: "Meta-curricular",  description: "Beyond the classroom",  href: "/meta-curricular", linkLabel: "See guide" },
];

type StepIcon = React.ComponentType<{ className?: string }>;

const STEPS: Array<{ n: number; tone: Tone; icon: StepIcon; title: string; body: string }> = [
  { n: 1, tone: "lavender", icon: Building2,   title: "Pick your school",    body: "DSSE for science/engineering. AHSS for arts, humanities & social sciences." },
  { n: 2, tone: "mint",     icon: Timer,       title: "Practice or mock",    body: "Warm up with untimed practice, or simulate the real test with a timed mock." },
  { n: 3, tone: "peach",    icon: TrendingUp,  title: "Review and improve",  body: "Every attempt is saved with per-question explanations and per-section scores." },
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
              Free Habib entry test preparation for DSSE and AHSS applicants —
              full-length Accuplacer mock tests, per-section practice, timed
              essay prompts, and one-on-one mock interviews with current Habib
              students.
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
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
            description="Pick your school on the left to see the exact test sections and skills covered."
          />
          <ExamBySchoolToggle />
        </Section>

        {/* How it works */}
        <Section spacing="lg">
          <SectionHeading
            eyebrow="How it works"
            eyebrowTone="peach"
            title="Three steps to test-ready"
          />
          <div className="relative mt-10 max-w-5xl mx-auto grid gap-12 md:grid-cols-3 md:gap-0">
            {STEPS.map((s, i) => (
              <Step
                key={s.n}
                {...s}
                showConnector={i < STEPS.length - 1}
              />
            ))}
          </div>
        </Section>

        {/* Related prep topics — every keyword the site covers, as anchor-text links */}
        <RelatedPrepTopics
          eyebrow="Prep topics"
          eyebrowTone="lavender"
          title="Habib entrance test prep, topic by topic"
          description="From Accuplacer math practice to Habib persuasive essay structure, every topic Habib evaluates has its own guide."
        />

        {/* CTA */}
        <Section spacing="lg">
          <div className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 md:p-16 shadow-soft bg-mesh-soft bg-card">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-pink blur-3xl opacity-70" aria-hidden />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-mint blur-3xl opacity-70" aria-hidden />
            {/* <Sticker tone="butter" rotate={-8} className="absolute top-4 right-6 z-10">
              <Sparkle color="currentColor" className="w-3 h-3" /> no card required
            </Sticker> */}
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-8 justify-between">
              <div className="max-w-xl min-w-0">
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
              <Button
                asChild
                size="xl"
                variant="brand"
                className="w-full md:w-auto shrink-0"
              >
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

function Step({
  n,
  tone,
  icon: Icon,
  title,
  body,
  showConnector,
}: {
  n: number;
  tone: Tone;
  icon: StepIcon;
  title: string;
  body: string;
  showConnector: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center text-center px-4">
      {showConnector && (
        <svg
          aria-hidden
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          className="hidden md:block pointer-events-none absolute text-brand"
          style={{
            top: "4.5rem",
            left: "calc(50% + 4rem)",
            width: "calc(100% - 8rem)",
            height: "2.25rem",
            overflow: "visible",
          }}
        >
          <path
            d={
              n % 2 === 1
                ? "M2,12 Q22,3 46,11 T78,9 T98,11"
                : "M2,9 Q24,17 48,10 T80,12 T98,10"
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeDasharray="9 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <div className="text-sm font-medium text-muted-foreground mb-3">{n}</div>
      <div className={cn("relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-5", toneBg[tone])}>
        <Icon className={cn("w-10 h-10", toneText[tone])} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[240px]">{body}</p>
    </div>
  );
}
