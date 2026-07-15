"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveMockAnswer, submitMockAttempt } from "./actions";
import type { SectionKey } from "@/lib/sections";

type Choice = { id: string; text: string };
type Q = {
  id: string;
  sectionKey: SectionKey;
  stem: string;
  passage: string | null;
  choices: Choice[];
  correctChoice: string;
};

type SectionMeta = { key: SectionKey; name: string; timeSeconds: number };

export function MockRunner({
  attemptId,
  mockTitle,
  sections,
  questions,
  initialAnswers,
}: {
  attemptId: string;
  mockTitle: string;
  sections: SectionMeta[];
  questions: Q[];
  initialAnswers: Record<string, { chosen: string | null; correct: boolean }>;
}) {
  const router = useRouter();
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [qid, a] of Object.entries(initialAnswers)) {
      if (a.chosen) initial[qid] = a.chosen;
    }
    return initial;
  });
  const [remaining, setRemaining] = useState(sections[0]?.timeSeconds ?? 0);
  const [pending, startTransition] = useTransition();
  const submittingRef = useRef(false);

  const currentSection = sections[sectionIdx];
  const sectionQuestions = useMemo(
    () => questions.filter((q) => q.sectionKey === currentSection.key),
    [questions, currentSection.key]
  );

  useEffect(() => {
    setRemaining(currentSection.timeSeconds);
  }, [sectionIdx, currentSection.timeSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      advanceSection();
      return;
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function choose(qid: string, choice: string) {
    setAnswers((a) => ({ ...a, [qid]: choice }));
    const q = questions.find((x) => x.id === qid);
    if (!q) return;
    const correct = choice === q.correctChoice;
    startTransition(async () => {
      await saveMockAnswer({ attemptId, questionId: qid, chosen: choice, correct });
    });
  }

  function advanceSection() {
    if (submittingRef.current) return;
    if (sectionIdx < sections.length - 1) {
      setSectionIdx((i) => i + 1);
    } else {
      submittingRef.current = true;
      startTransition(async () => {
        await submitMockAttempt({ attemptId });
        router.push(`/attempts/${attemptId}`);
      });
    }
  }

  const mins = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, "0");
  const answeredCount = sectionQuestions.filter((q) => answers[q.id]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Mock · {mockTitle}
          </div>
          <h1 className="text-xl font-semibold">
            {currentSection.name}{" "}
            <span className="text-muted-foreground text-sm">
              (Section {sectionIdx + 1} of {sections.length})
            </span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={remaining < 60 ? "destructive" : "secondary"}>
            ⏱ {mins}:{secs}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Answered {answeredCount}/{sectionQuestions.length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {sectionQuestions.map((q, i) => (
          <Card key={q.id}>
            <CardHeader>
              <div className="text-xs text-muted-foreground">Q{i + 1}</div>
              {q.passage && (
                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {q.passage}
                </div>
              )}
              <div className="text-base font-medium mt-2">{q.stem}</div>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.choices.map((c) => {
                const selected = answers[q.id] === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => choose(q.id, c.id)}
                    className={cn(
                      "w-full text-left border rounded-md p-3 transition-colors",
                      selected ? "border-brand bg-brand/5" : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium mr-2">{c.id}.</span>
                    {c.text}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between border bg-background rounded-lg p-3 shadow-sm">
        <div className="text-sm text-muted-foreground">
          {sectionIdx < sections.length - 1
            ? "Finish this section to move to the next."
            : "This is the last section. Submitting will finalize your mock."}
        </div>
        <Button variant="brand" disabled={pending} onClick={advanceSection}>
          {pending
            ? "Saving…"
            : sectionIdx < sections.length - 1
              ? "End section →"
              : "Submit mock"}
        </Button>
      </div>
    </div>
  );
}
