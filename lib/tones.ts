export type Tone =
  | "lavender"
  | "mint"
  | "peach"
  | "pink"
  | "sky"
  | "butter";

export const TONES: Tone[] = ["lavender", "mint", "peach", "pink", "sky", "butter"];

// Rotate through pastels for grids. Deterministic given an index.
export function toneAt(i: number): Tone {
  return TONES[i % TONES.length];
}

// Tailwind class pairs. Kept as static strings so JIT can find them.
export const toneBg: Record<Tone, string> = {
  lavender: "bg-lavender",
  mint: "bg-mint",
  peach: "bg-peach",
  pink: "bg-pink",
  sky: "bg-sky",
  butter: "bg-butter",
};

export const toneText: Record<Tone, string> = {
  lavender: "text-lavender-ink",
  mint: "text-mint-ink",
  peach: "text-peach-ink",
  pink: "text-pink-ink",
  sky: "text-sky-ink",
  butter: "text-butter-ink",
};

export const toneBorder: Record<Tone, string> = {
  lavender: "border-lavender-ink/15",
  mint: "border-mint-ink/15",
  peach: "border-peach-ink/15",
  pink: "border-pink-ink/15",
  sky: "border-sky-ink/15",
  butter: "border-butter-ink/15",
};

export const toneRing: Record<Tone, string> = {
  lavender: "ring-lavender-ink/20",
  mint: "ring-mint-ink/20",
  peach: "ring-peach-ink/20",
  pink: "ring-pink-ink/20",
  sky: "ring-sky-ink/20",
  butter: "ring-butter-ink/20",
};
