import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { toneBg, toneText, type Tone } from "@/lib/tones";
import type { School } from "@/lib/schools";

export function SchoolCard({ school, tone }: { school: School; tone: Tone }) {
  return (
    <Link
      href={`/schools/${school.slug}`}
      className="group relative flex flex-col gap-4 rounded-3xl border p-8 md:p-10 shadow-soft transition-all duration-150 hover:shadow-pop hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:shadow-soft overflow-hidden bg-card"
    >
      <div
        className={cn(
          "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-80 transition-opacity group-hover:opacity-100",
          toneBg[tone]
        )}
        aria-hidden
      />
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
      <div
        className={cn(
          "relative mt-2 inline-flex items-center text-sm font-medium",
          toneText[tone]
        )}
      >
        View test details
        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
