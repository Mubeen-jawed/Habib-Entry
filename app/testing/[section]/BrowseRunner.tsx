"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/lib/sections";

type Choice = { id: string; text: string; imageUrl?: string | null };
type Q = {
  id: string;
  externalId: string | null;
  stem: string;
  passage: string | null;
  stemImageUrl: string | null;
  explanationImageUrl: string | null;
  choices: Choice[];
  correctChoice: string;
  explanation: string | null;
  difficulty: number;
};

export function BrowseRunner({
  sectionKey,
  sectionName,
  questions,
}: {
  sectionKey: SectionKey;
  sectionName: string;
  questions: Q[];
}) {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);

  const total = questions.length;
  const q = questions[idx];

  useEffect(() => {
    setChosen(null);
    setReveal(false);
  }, [idx]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return;
      if (e.key === "ArrowRight") setIdx((i) => Math.min(total - 1, i + 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (total === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No renderable {sectionName} questions in the database.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Testing
          </div>
          <h1 className="text-xl font-semibold">{sectionName}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">
            Question {idx + 1} of {total}
          </Badge>
          <span className="text-xs text-muted-foreground">
            id: {q.externalId ?? "—"} · difficulty {q.difficulty}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          {q.stemImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={q.stemImageUrl}
              alt="Figure for the question"
              className={cn(
                "bg-white self-center mb-3",
                sectionKey === "MATH"
                  ? "w-full max-h-none"
                  : "max-h-[780px] w-auto",
              )}
            />
          )}
          {q.passage && (
            <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-line">
              {q.passage}
            </div>
          )}
          {q.stem && !(sectionKey === "MATH" && q.stemImageUrl) && (
            <div className="text-base font-medium mt-2">{q.stem}</div>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {q.choices.map((c) => {
            const selected = chosen === c.id;
            const isCorrect = reveal && c.id === q.correctChoice;
            const isWrong = reveal && selected && c.id !== q.correctChoice;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChosen(c.id)}
                className={cn(
                  "w-full text-left border rounded-md p-3 transition-colors flex items-start gap-2",
                  selected && !reveal && "border-brand bg-brand/5",
                  isCorrect && "border-emerald-500 bg-emerald-50",
                  isWrong && "border-destructive bg-destructive/10",
                  !selected && !reveal && "hover:bg-muted",
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
                      sectionKey === "MATH" ? "max-h-[36rem]" : "max-h-[18rem]",
                    )}
                  />
                ) : (
                  <span className="flex-1 min-w-0">{c.text}</span>
                )}
              </button>
            );
          })}

          {reveal && q.explanationImageUrl && (
            <div className="rounded-md bg-muted/40 p-3 mt-3">
              <div className="font-semibold mb-2 text-sm">Explanation</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={q.explanationImageUrl}
                alt="Explanation"
                className="w-full h-auto bg-white"
              />
            </div>
          )}
          {reveal && !q.explanationImageUrl && q.explanation && (
            <div className="rounded-md bg-muted/40 p-3 text-sm mt-3">
              <div className="font-semibold mb-1">Explanation</div>
              <div className="whitespace-pre-line">{q.explanation}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">Testing (← →)</span>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            aria-label="Previous question"
            className="rounded-md border p-1 hover:bg-muted disabled:opacity-40"
            disabled={idx <= 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            aria-label="Next question"
            className="rounded-md border p-1 hover:bg-muted disabled:opacity-40"
            disabled={idx >= total - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReveal((r) => !r)}
        >
          {reveal ? "Hide answer" : "Reveal answer"}
        </Button>
      </div>
    </div>
  );
}
