import { cn } from "@/lib/utils";

type Motif = {
  className: string;
  label: string;
  rot?: number;
};

// Floating monochrome motifs behind the hero. Positioned absolutely relative
// to the parent (parent must be `relative overflow-hidden`). Uses short text
// labels only, no pictographs or emoji.
const DEFAULT_MOTIFS: Motif[] = [
  { label: "01", className: "top-[12%] left-[6%] text-lg", rot: -8 },
  { label: "II", className: "top-[20%] right-[8%] text-lg", rot: 6 },
  { label: "A+", className: "bottom-[22%] left-[10%] text-lg", rot: -4 },
  { label: "MCQ", className: "bottom-[16%] right-[12%] text-xs", rot: 10 },
  { label: "x²", className: "top-[46%] left-[3%] text-lg", rot: 0 },
  { label: "N/A", className: "top-[52%] right-[4%] text-xs", rot: 4 },
];

export function FloatingMotifs({
  motifs = DEFAULT_MOTIFS,
  className,
}: {
  motifs?: Motif[];
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 hidden md:block",
        className
      )}
    >
      {motifs.map((m, i) => (
        <div
          key={i}
          style={{ ["--rot" as string]: `${m.rot ?? 0}deg` }}
          className={cn(
            "absolute rounded-2xl border border-foreground/25 bg-card text-foreground shadow-soft w-14 h-14 flex items-center justify-center font-semibold tracking-tight",
            i % 2 === 0 ? "animate-float-slow" : "animate-float-slower",
            m.className
          )}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
}
