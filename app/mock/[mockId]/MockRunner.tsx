"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveMockAnswer, saveMockEssay, submitMockAttempt } from "./actions";
import type { SectionKey } from "@/lib/sections";

type Choice = { id: string; text: string; imageUrl?: string | null };
type Q = {
  id: string;
  sectionKey: SectionKey;
  stem: string;
  passage: string | null;
  stemImageUrl: string | null;
  choices: Choice[];
  correctChoice: string;
};

type SectionMeta = { key: SectionKey; name: string };

const WARN_SECONDS = 300;

export function MockRunner({
  attemptId,
  sections,
  questions,
  initialAnswers,
  essayPrompt,
  initialEssayText,
  remainingSeconds,
}: {
  attemptId: string;
  sections: SectionMeta[];
  questions: Q[];
  initialAnswers: Record<string, { chosen: string | null; correct: boolean }>;
  essayPrompt: string;
  initialEssayText: string;
  remainingSeconds: number;
}) {
  const router = useRouter();

  // Flatten into an ordered list of questions across all sections.
  const ordered = useMemo(() => {
    const bySection = new Map<SectionKey, Q[]>();
    for (const q of questions) {
      const arr = bySection.get(q.sectionKey) ?? [];
      arr.push(q);
      bySection.set(q.sectionKey, arr);
    }
    const out: Q[] = [];
    for (const s of sections) {
      const arr = bySection.get(s.key) ?? [];
      for (const q of arr) out.push(q);
    }
    return out;
  }, [questions, sections]);

  const sectionIndexByKey = useMemo(() => {
    const m = new Map<SectionKey, number>();
    sections.forEach((s, i) => m.set(s.key, i));
    return m;
  }, [sections]);

  // Determine resume point: first question that hasn't been answered yet.
  const resumeIdx = useMemo(() => {
    for (let i = 0; i < ordered.length; i++) {
      if (!initialAnswers[ordered[i].id]) return i;
    }
    return ordered.length; // all answered → essay phase
  }, [ordered, initialAnswers]);

  const [idx, setIdx] = useState(resumeIdx);
  const [chosen, setChosen] = useState<string | null>(null);
  const [essayText, setEssayText] = useState(initialEssayText);
  const [remaining, setRemaining] = useState(remainingSeconds);
  const [pending, startTransition] = useTransition();
  const submittingRef = useRef(false);

  const inEssay = idx >= ordered.length;
  const currentQ = inEssay ? null : ordered[idx];
  const currentSectionKey = currentQ?.sectionKey ?? null;
  const currentSectionIdx =
    currentSectionKey !== null
      ? sectionIndexByKey.get(currentSectionKey) ?? 0
      : sections.length; // essay considered "after" last section

  // Position within the current section (1-indexed).
  const positionInSection = useMemo(() => {
    if (!currentQ) return 0;
    let pos = 0;
    for (let i = 0; i <= idx; i++) {
      if (ordered[i].sectionKey === currentQ.sectionKey) pos++;
    }
    return pos;
  }, [idx, ordered, currentQ]);

  const sectionSize = useMemo(() => {
    if (!currentQ) return 0;
    return ordered.filter((q) => q.sectionKey === currentQ.sectionKey).length;
  }, [ordered, currentQ]);

  useEffect(() => {
    if (remaining <= 0) {
      finalize();
      return;
    }
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in a text field (essay textarea, inputs).
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return;
      if (e.key === "ArrowRight") {
        setChosen(null);
        setIdx((i) => Math.min(ordered.length, i + 1));
      } else if (e.key === "ArrowLeft") {
        setChosen(null);
        setIdx((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ordered.length]);

  function finalize() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    startTransition(async () => {
      if (essayPrompt) {
        try {
          await saveMockEssay({ attemptId, prompt: essayPrompt, text: essayText });
        } catch {
          /* ignore, still submit */
        }
      }
      await submitMockAttempt({ attemptId });
      router.push(`/attempts/${attemptId}`);
    });
  }

  function next() {
    if (pending || submittingRef.current) return;

    if (inEssay) {
      finalize();
      return;
    }

    const q = ordered[idx];
    const choice = chosen;
    const correct = choice === q.correctChoice;

    startTransition(async () => {
      // Persist even a null-choice? Only save if a choice is picked;
      // if user skips, we just advance without recording an answer.
      if (choice) {
        await saveMockAnswer({
          attemptId,
          questionId: q.id,
          chosen: choice,
          correct,
        });
      }
      setChosen(null);
      setIdx((i) => i + 1);
    });
  }

  const hh = Math.floor(remaining / 3600);
  const mm = Math.floor((remaining % 3600) / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  const timerLabel = `${hh}:${mmStr}:${ss}`;
  const nearEnd = remaining < WARN_SECONDS;

  // ----- Rendering -----

  const currentSection = currentQ ? sections[currentSectionIdx] : null;

  return (
    <div className="space-y-6">
      {nearEnd && !submittingRef.current && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Less than {Math.ceil(remaining / 60)} minute
          {Math.ceil(remaining / 60) === 1 ? "" : "s"} left, the mock will
          auto-submit when the timer hits zero.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {inEssay ? "Essay" : currentSection?.name ?? ""}{" "}
            {!inEssay && (
              <span className="text-muted-foreground text-sm">
                (Section {currentSectionIdx + 1} of {sections.length + 1})
              </span>
            )}
            {inEssay && (
              <span className="text-muted-foreground text-sm">
                (Section {sections.length + 1} of {sections.length + 1})
              </span>
            )}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={nearEnd ? "destructive" : "secondary"}>
            ⏱ {timerLabel}
          </Badge>
          {!inEssay && (
            <span className="text-xs text-muted-foreground">
              Question {positionInSection} of {sectionSize}
            </span>
          )}
        </div>
      </div>

      {!inEssay && currentQ && (
        <Card>
          <CardHeader>
            {currentQ.stemImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentQ.stemImageUrl}
                alt="Figure for the question"
                className={cn(
                  "bg-white self-center mb-3",
                  currentQ.sectionKey === "MATH"
                    ? "w-full max-h-none"
                    : "max-h-[780px] w-auto",
                )}
              />
            )}
            {currentQ.passage && (
              <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-line">
                {currentQ.passage}
              </div>
            )}
            {currentQ.stem &&
              !(currentQ.sectionKey === "MATH" && currentQ.stemImageUrl) && (
                <div className="text-base font-medium mt-2">{currentQ.stem}</div>
              )}
          </CardHeader>
          <CardContent className="space-y-2">
            {currentQ.choices.map((c) => {
              const selected = chosen === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChosen(c.id)}
                  className={cn(
                    "w-full text-left border rounded-md p-3 transition-colors flex items-start gap-2",
                    selected ? "border-brand bg-brand/5" : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{c.id}.</span>
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={`Choice ${c.id}`}
                      className={cn(
                        "flex-1 w-auto bg-white",
                        currentQ.sectionKey === "MATH"
                          ? "max-h-[36rem]"
                          : "max-h-[18rem]",
                      )}
                    />
                  ) : (
                    <span className="flex-1 min-w-0">{c.text}</span>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {inEssay && (
        <Card>
          <CardHeader>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Prompt
            </div>
            <div className="mt-1 text-base font-medium leading-snug">
              {essayPrompt || "No prompt configured for this mock."}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Write a five-paragraph response of ~350–500 words. Your essay will
              be saved with your mock attempt.
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Start writing here…"
              className="w-full min-h-[360px] rounded-md border bg-background p-4 text-sm leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">Testing (← →)</span>
          <button
            type="button"
            onClick={() => {
              setChosen(null);
              setIdx((i) => Math.max(0, i - 1));
            }}
            aria-label="Previous question (testing)"
            className="rounded-md border p-1 hover:bg-muted disabled:opacity-40"
            disabled={idx <= 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setChosen(null);
              setIdx((i) => Math.min(ordered.length, i + 1));
            }}
            aria-label="Next question (testing)"
            className="rounded-md border p-1 hover:bg-muted disabled:opacity-40"
            disabled={idx >= ordered.length}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Button
          variant="brand"
          disabled={pending || (!inEssay && !chosen)}
          onClick={next}
        >
          {pending
            ? "Saving…"
            : inEssay
              ? "Submit mock"
              : "Next"}
        </Button>
      </div>
    </div>
  );
}
