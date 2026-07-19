"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseChoices, checkSprAnswer, type SectionKey } from "@/lib/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitPracticeAnswer, finishPracticeAttempt } from "./actions";

type Q = {
  id: string;
  stem: string;
  passage: string | null;
  stemImageUrl: string | null;
  explanationImageUrl: string | null;
  questionType: string; // "MCQ" | "SPR"
  choicesJson: string;
  correctChoice: string;
  explanation: string | null;
};

export function PracticeRunner({
  attemptId,
  sectionKey,
  sectionName,
  schoolCode,
  schoolName,
  questions,
}: {
  attemptId: string;
  sectionKey: SectionKey;
  sectionName: string;
  schoolCode?: string | null;
  schoolName?: string | null;
  questions: Q[];
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sprInput, setSprInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [pending, startTransition] = useTransition();

  const q = questions[idx];
  const isSpr = q.questionType === "SPR";
  const choices = useMemo(() => parseChoices(q.choicesJson), [q.choicesJson]);
  const isLast = idx === questions.length - 1;
  const answer = isSpr ? sprInput.trim() : chosen;

  function submit() {
    if (!answer || revealed) return;
    const correct = isSpr
      ? checkSprAnswer(answer, q.correctChoice)
      : chosen === q.correctChoice;
    startTransition(async () => {
      await submitPracticeAnswer({
        attemptId,
        questionId: q.id,
        chosen: answer,
        correct,
      });
      setRevealed(true);
      if (correct) setCorrectSoFar((c) => c + 1);
    });
  }

  function next() {
    if (isLast) {
      startTransition(async () => {
        await finishPracticeAttempt({ attemptId });
        router.push(`/attempts/${attemptId}`);
      });
      return;
    }
    setIdx((i) => i + 1);
    setChosen(null);
    setSprInput("");
    setRevealed(false);
  }

  const sprCorrect = isSpr && revealed && checkSprAnswer(sprInput, q.correctChoice);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Practice · {sectionName}
            {schoolCode && (
              <>
                {" · "}
                <span title={schoolName ?? undefined}>{schoolCode}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-semibold">
            Question {idx + 1} <span className="text-muted-foreground">of {questions.length}</span>
          </h1>
          {schoolName && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Practicing for {schoolName}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Correct so far: <span className="font-medium text-foreground">{correctSoFar}</span>
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
          {isSpr ? (
            <div className="space-y-2">
              <label className="text-sm font-medium block">Your answer</label>
              <Input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Type a number (e.g. 3, 0.5, 3/2)"
                value={sprInput}
                onChange={(e) => setSprInput(e.target.value)}
                disabled={revealed}
                className={cn(
                  revealed && sprCorrect && "border-emerald-500 bg-emerald-50",
                  revealed && !sprCorrect && "border-destructive bg-destructive/10"
                )}
              />
              {revealed && (
                <div
                  className={cn(
                    "text-sm mt-2",
                    sprCorrect ? "text-emerald-700" : "text-destructive"
                  )}
                >
                  {sprCorrect
                    ? "Correct."
                    : `Correct answer: ${q.correctChoice}`}
                </div>
              )}
            </div>
          ) : (
            choices.map((c) => {
              const selected = chosen === c.id;
              const isCorrect = revealed && c.id === q.correctChoice;
              const isWrong = revealed && selected && c.id !== q.correctChoice;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !revealed && setChosen(c.id)}
                  disabled={revealed}
                  className={cn(
                    "w-full text-left border rounded-md p-3 transition-colors flex items-start gap-2",
                    selected && !revealed && "border-brand bg-brand/5",
                    isCorrect && "border-emerald-500 bg-emerald-50",
                    isWrong && "border-destructive bg-destructive/10",
                    !selected && !revealed && "hover:bg-muted"
                  )}
                >
                  <span className="font-medium">{c.id}.</span>
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={`Choice ${c.id}`}
                      className={cn(
                        "bg-white",
                        sectionKey === "MATH"
                          ? "flex-1 max-h-[36rem] w-auto"
                          : "flex-1 max-h-[18rem] w-auto",
                      )}
                    />
                  ) : (
                    <span className="flex-1 min-w-0">{c.text}</span>
                  )}
                </button>
              );
            })
          )}

          {revealed && q.explanationImageUrl && (
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
          {revealed && !q.explanationImageUrl && q.explanation && (
            <div className="rounded-md bg-muted/40 p-3 text-sm mt-3">
              <div className="font-semibold mb-1">Explanation</div>
              <div className="whitespace-pre-line">{q.explanation}</div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Exit practice</Link>
            </Button>
            {!revealed ? (
              <Button
                variant="brand"
                disabled={!answer || pending}
                onClick={submit}
              >
                {pending ? "Saving…" : "Next"}
              </Button>
            ) : (
              <Button variant="brand" disabled={pending} onClick={next}>
                {pending ? "…" : isLast ? "Finish" : "Next"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
