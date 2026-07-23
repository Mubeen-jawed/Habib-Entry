"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Squiggle } from "@/components/ui/scribble";
import {
  GUIDES,
  UNIVERSAL_RULES,
  type ActivityRow,
  type ActivityTier,
} from "@/lib/meta-curricular";
import type { SchoolSlug } from "@/lib/schools";

const TAB_ORDER: SchoolSlug[] = ["dsse", "ahss"];

const TIERS: Array<{
  key: ActivityTier;
  label: string;
  title: string;
  color: string;
}> = [
  { key: "s", label: "S", title: "Heavy hitters",                 color: "bg-rose-400"    },
  { key: "a", label: "A", title: "Strong signals",                color: "bg-orange-300"  },
  { key: "b", label: "B", title: "Nice supporting acts",          color: "bg-yellow-300"  },
  { key: "c", label: "C", title: "Bonus points",                  color: "bg-emerald-400" },
  { key: "d", label: "D", title: "Skip if that's all you've got", color: "bg-sky-400"     },
];

function TierRow({
  tier,
  rows,
}: {
  tier: (typeof TIERS)[number];
  rows: ActivityRow[];
  isLast: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex items-stretch bg-muted">
      <div
        className={cn(
          "shrink-0 w-20 md:w-28 flex items-center justify-center px-2 py-4 border-r-[3px] border-background text-foreground",
          tier.color
        )}
      >
        <span className="text-3xl md:text-4xl font-black leading-none">
          {tier.label}
        </span>
      </div>
      <div className="flex-1 min-w-0 p-2.5 flex flex-wrap gap-2 items-start content-start">
        {rows.map((row) => (
          <div
            key={row.activity}
            title={row.why}
            className="group rounded-lg bg-card hover:bg-background border border-foreground/15 hover:border-foreground/30 px-2.5 py-2 max-w-[200px] transition-colors shadow-soft"
          >
            <div className="text-[13px] font-semibold text-foreground leading-tight">
              {row.activity}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
              {row.why}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetaCurricularGuide({
  defaultSchool = "dsse",
  lockToSchool = false,
  enableZoom = true,
}: {
  defaultSchool?: SchoolSlug;
  lockToSchool?: boolean;
  enableZoom?: boolean;
}) {
  const [active, setActive] = useState<SchoolSlug>(defaultSchool);
  const [zoom, setZoom] = useState(1);
  const zoomHostRef = useRef<HTMLDivElement | null>(null);
  const guide = GUIDES[active];

  useEffect(() => {
    if (!enableZoom) return;
    const el = zoomHostRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      // Mobile: let native page scroll happen.
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
        return;
      }
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setZoom((z) => {
        const next = z + delta;
        return Math.min(1.6, Math.max(0.7, Math.round(next * 100) / 100));
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [enableZoom]);

  return (
    <div className="space-y-14">
      {!lockToSchool && (
        <div
          role="tablist"
          aria-label="Choose a school"
          className="flex flex-wrap gap-3"
        >
          {TAB_ORDER.map((slug, i) => {
            const g = GUIDES[slug];
            const isActive = slug === active;
            const rotate = i % 2 === 0 ? -3 : 3;
            return (
              <button
                key={slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(slug)}
                style={{ transform: `rotate(${isActive ? 0 : rotate}deg)` }}
                className={cn(
                  "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "border-foreground bg-foreground text-background shadow-pop -translate-y-0.5"
                    : "border-foreground/25 bg-card text-foreground/80 hover:border-foreground/60 hover:-translate-y-0.5"
                )}
              >
                {g.code}
              </button>
            );
          })}
        </div>
      )}

      <section>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <div className="text-[11px] uppercase tracking-widest text-foreground/50 font-semibold">
            {guide.code}
          </div>
          <div className="text-xs text-muted-foreground">— {guide.scope}</div>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          What actually{" "}
          <span className="relative inline-block">
            moves the needle
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="absolute left-0 right-0 -bottom-1 w-full h-2.5 pointer-events-none text-foreground/70"
            >
              <path
                d="M4 8 C 60 2, 130 12, 200 6 S 290 8, 296 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </h2>
        

        <div
          ref={zoomHostRef}
          className={cn(
            "mt-8 -mx-4 md:mx-0",
            enableZoom && "md:overflow-x-auto md:overscroll-contain"
          )}
        >
          <div
            style={{ zoom } as CSSProperties}
            className="rounded-none md:rounded-2xl overflow-hidden border-y-[3px] md:border-[3px] border-background shadow-pop"
          >
            {TIERS.map((tier, i) => (
              <TierRow
                key={tier.key}
                tier={tier}
                rows={guide.activities.filter((r) => r.tier === tier.key)}
                isLast={i === TIERS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      <Squiggle className="text-foreground/20" />

      <section>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          What impresses{" "}
          <span className="relative inline-block">
            {guide.code}
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="absolute left-0 right-0 -bottom-1 w-full h-2.5 pointer-events-none text-foreground/70"
            >
              <path
                d="M4 8 C 60 2, 130 12, 200 6 S 290 8, 296 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          most
        </h2>
        <p className="text-sm text-muted-foreground mt-3">
          Anchor your top entries around these themes.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {guide.impresses.map((item, i) => (
            <span
              key={item}
              style={{ transform: `rotate(${(i % 5) - 2}deg)` }}
              className="inline-flex items-center rounded-2xl border border-foreground/25 bg-card px-3.5 py-1.5 text-sm font-medium shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <Squiggle className="text-foreground/20" />

      <section>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Do this,{" "}
          <span className="relative inline-block">
            not that
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="absolute left-0 right-0 -bottom-1 w-full h-2.5 pointer-events-none text-foreground/70"
            >
              <path
                d="M4 8 C 60 2, 130 12, 200 6 S 290 8, 296 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>
        <p className="text-sm text-muted-foreground mt-3">
          Applies to every entry, no matter which school.
        </p>

        <ol className="mt-8 space-y-5">
          {UNIVERSAL_RULES.map((rule, i) => (
            <li key={rule.do} className="grid gap-x-6 gap-y-1 md:grid-cols-2 items-start">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xs text-foreground/40 tabular-nums font-mono w-4 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
                <span className="text-sm text-foreground">{rule.do}</span>
              </div>
              <div className="flex items-start gap-3 md:pl-6 md:border-l md:border-dashed md:border-foreground/15">
                <X className="w-4 h-4 mt-0.5 text-foreground/40 shrink-0" />
                <span className="text-sm text-muted-foreground line-through decoration-foreground/20">
                  {rule.dont}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
