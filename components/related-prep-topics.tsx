import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/tones";
import { SEO_LANDING_PAGES } from "@/lib/seo-landing";

export function RelatedPrepTopics({
  slugs,
  title = "Explore Habib entrance test prep by topic",
  description,
  eyebrow = "Related resources",
  eyebrowTone = "lavender",
  spacing = "md",
  align = "center",
  className,
}: {
  slugs?: string[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  eyebrowTone?: Tone;
  spacing?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}) {
  const pages = (slugs && slugs.length > 0
    ? slugs
        .map((s) => SEO_LANDING_PAGES.find((p) => p.slug === s))
        .filter((p): p is (typeof SEO_LANDING_PAGES)[number] => Boolean(p))
    : SEO_LANDING_PAGES);

  if (pages.length === 0) return null;

  return (
    <Section spacing={spacing} className={className}>
      <SectionHeading
        eyebrow={eyebrow}
        eyebrowTone={eyebrowTone}
        title={title}
        description={description}
        align={align}
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/${p.slug}`}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-soft transition-colors hover:bg-accent"
            )}
          >
            <span className="font-medium text-sm">{p.keyword}</span>
            <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Section>
  );
}

export const RELATED_SLUGS = {
  all: undefined as string[] | undefined,
  test: [
    "habib-entry-test",
    "habib-entry-test-pattern",
    "habib-test-preparation",
    "habib-mock-test",
    "habib-mock-exam-free",
    "accuplacer-practice-test",
    "accuplacer-math-practice",
    "accuplacer-english-practice",
  ],
  dsse: [
    "habib-university-dsse-entry-test-preparation",
    "habib-advanced-math",
    "habib-algebra-questions",
    "habib-trigonometry-questions",
    "habib-math-practice",
    "accuplacer-math-practice",
    "habib-mock-test",
    "habib-scholarship-test",
  ],
  ahss: [
    "habib-university-ahss-test-preparation",
    "habib-essay-writing-practice",
    "habib-persuasive-essay",
    "habib-essay-examples",
    "accuplacer-reading-questions",
    "accuplacer-writing-practice",
    "habib-mock-test",
    "habib-scholarship-test",
  ],
  essay: [
    "habib-persuasive-essay",
    "habib-essay-writing-practice",
    "habib-essay-examples",
    "accuplacer-writing-practice",
    "accuplacer-reading-questions",
    "habib-test-preparation",
    "habib-university-ahss-test-preparation",
    "habib-mock-test",
  ],
  interview: [
    "habib-admission-interview-preparation",
    "habib-test-preparation",
    "habib-essay-writing-practice",
    "habib-mock-exam-free",
    "habib-mock-test",
    "habib-university-dsse-entry-test-preparation",
    "habib-university-ahss-test-preparation",
    "habib-scholarship-test",
  ],
  grades: [
    "habib-scholarship-test",
    "habib-test-preparation",
    "habib-entry-test",
    "habib-mock-exam-free",
    "habib-university-dsse-entry-test-preparation",
    "habib-university-ahss-test-preparation",
    "habib-essay-writing-practice",
    "habib-admission-interview-preparation",
  ],
  metaCurricular: [
    "habib-test-preparation",
    "habib-entry-test",
    "habib-scholarship-test",
    "habib-mock-test",
    "habib-essay-writing-practice",
    "habib-admission-interview-preparation",
    "habib-university-dsse-entry-test-preparation",
    "habib-university-ahss-test-preparation",
  ],
} as const;
