export const SECTION_KEYS = ["MATH", "READING", "WRITING"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_BY_SLUG: Record<string, SectionKey> = {
  math: "MATH",
  reading: "READING",
  writing: "WRITING",
};

export const SLUG_BY_SECTION: Record<SectionKey, string> = {
  MATH: "math",
  READING: "reading",
  WRITING: "writing",
};

export const SECTION_NAMES: Record<SectionKey, string> = {
  MATH: "Math",
  READING: "English — Reading",
  WRITING: "English — Writing",
};

export type Choice = { id: string; text: string; imageUrl?: string | null };

export function parseChoices(choicesJson: string): Choice[] {
  try {
    const parsed = JSON.parse(choicesJson);
    if (Array.isArray(parsed)) return parsed as Choice[];
  } catch {
    /* fall through */
  }
  return [];
}

/**
 * Normalize an SPR (Student-Produced Response) answer for comparison.
 * The College Board bank stores answers like "3/2" or ".1764, .1765, 3/17"
 * (any of the listed forms is correct).
 */
export function checkSprAnswer(input: string, correct: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  const user = norm(input);
  if (!user) return false;
  const alternatives = correct.split(",").map(norm);
  return alternatives.includes(user);
}
