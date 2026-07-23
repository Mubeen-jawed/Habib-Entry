import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { Section, SectionHeading } from "@/components/ui/section";
import { SchoolCard } from "@/components/school-card";
import { SCHOOL_LIST } from "@/lib/schools";
import type { Tone } from "@/lib/tones";

export const metadata = {
  title: "Habib entry test pattern — DSSE & AHSS Accuplacer breakdown | Imtehan",
  description:
    "The full Habib entry test pattern for 2026 — Accuplacer sections, timings, and question counts for DSSE and AHSS applicants, plus links to targeted Habib test preparation.",
  alternates: { canonical: "/test" },
};

const SCHOOL_TONES: Record<string, Tone> = {
  dsse: "sky",
  ahss: "peach",
};

export default function TestPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 pt-8 md:pt-10">
          <BackButton />
        </div>
        <Section spacing="sm" className="scroll-mt-20" id="schools">
          <SectionHeading
            eyebrow="Entrance test"
            eyebrowTone="lavender"
            title="Which school are you applying to?"
            description="Both schools share Reading, Writing, and the Essay. Only the math component differs. Pick a school to see the full test breakdown."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {SCHOOL_LIST.map((s) => (
              <SchoolCard
                key={s.slug}
                school={s}
                tone={SCHOOL_TONES[s.slug] ?? "lavender"}
              />
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
