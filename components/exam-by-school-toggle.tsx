"use client";

import { useState } from "react";
import { BookOpen, Calculator, PenLine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOLS, type SchoolSlug, type TestComponent } from "@/lib/schools";
import { IconTile } from "@/components/ui/icon-tile";
import type { Tone } from "@/lib/tones";

const TABS: Array<{ slug: SchoolSlug; short: string }> = [
  { slug: "dsse", short: "Science & Engineering" },
  { slug: "ahss", short: "Arts, Humanities & Social Sciences" },
];

// One-line topic blurbs per component. Kept short so the card stays scannable;
// the detailed skill breakdown lives on the school-specific page.
const TOPICS: Record<string, string> = {
  reading: "Central ideas, rhetoric, vocabulary, synthesis.",
  writing: "Grammar, sentence structure, organization.",
  essay: "One persuasive prompt, 5-paragraph response.",
  alm: "Algebra, functions, geometry, trigonometry.",
  arithmetic: "Fractions, decimals, percent, squares & roots.",
};

function iconFor(key: string): LucideIcon {
  if (key === "reading") return BookOpen;
  if (key === "writing" || key === "essay") return PenLine;
  return Calculator;
}

function toneFor(key: string): Tone {
  if (key === "reading") return "mint";
  if (key === "writing") return "pink";
  if (key === "essay") return "lavender";
  return "peach";
}

export function ExamBySchoolToggle() {
  const [active, setActive] = useState<SchoolSlug>("dsse");
  const school = SCHOOLS[active];
  const components: TestComponent[] = [...school.shared, school.specific];

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <nav
        aria-label="Choose a school"
        className="flex flex-row md:flex-col gap-2"
      >
        {TABS.map((t) => {
          const isActive = t.slug === active;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              aria-pressed={isActive}
              className={cn(
                "group flex-1 md:flex-none text-left rounded-2xl border p-4 transition-all",
                isActive
                  ? "border-brand bg-brand-soft shadow-soft"
                  : "border-border/60 bg-card hover:border-border hover:-translate-y-0.5"
              )}
            >
              <div
                className={cn(
                  "text-xs uppercase tracking-widest font-semibold",
                  isActive ? "text-brand-strong" : "text-muted-foreground"
                )}
              >
                {SCHOOLS[t.slug].code}
              </div>
              <div
                className={cn(
                  "mt-1 text-sm font-medium leading-snug",
                  isActive ? "text-brand-ink" : "text-foreground/80"
                )}
              >
                {t.short}
              </div>
            </button>
          );
        })}
      </nav>

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight">
            {school.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{school.tagline}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {components.map((c) => {
            const Icon = iconFor(c.key);
            const tone = toneFor(c.key);
            return (
              <div
                key={c.key}
                className="rounded-2xl border bg-card p-5 shadow-soft space-y-2"
              >
                <div className="flex items-center gap-3">
                  <IconTile icon={Icon} tone={tone} />
                  <div className="font-semibold text-sm leading-tight">
                    {c.name}
                  </div>
                </div>
                {TOPICS[c.key] && (
                  <p className="text-sm text-foreground/70 leading-snug">
                    {TOPICS[c.key]}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">{c.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
