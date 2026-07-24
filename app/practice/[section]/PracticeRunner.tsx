"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseChoices, checkSprAnswer, type SectionKey } from "@/lib/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  submitPracticeAnswer,
  finishPracticeAttempt,
  discardPracticeAttempt,
} from "./actions";
import { clearSnapshot, readSnapshot, writeSnapshot } from "@/lib/guest-storage";
import {
  LeaveTestGuard,
  NAV_GUARD_BYPASS_ATTR,
  leaveTestAndGoTo,
} from "@/components/leave-test-guard";

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

type PracticeSnapshot = {
  questions: Q[];
  idx: number;
  chosen: string | null;
  sprInput: string;
  revealed: boolean;
  correctSoFar: number;
  finished: boolean;
};

export function PracticeRunner({
  attemptId,
  sectionKey,
  sectionName,
  schoolCode,
  schoolName,
  questions: initialQuestions,
  totalSectionQuestions,
  isGuest = false,
  initialIdx = 0,
  initialCorrectSoFar = 0,
}: {
  attemptId: string;
  sectionKey: SectionKey;
  sectionName: string;
  schoolCode?: string | null;
  schoolName?: string | null;
  questions: Q[];
  totalSectionQuestions: number;
  isGuest?: boolean;
  initialIdx?: number;
  initialCorrectSoFar?: number;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Q[]>(initialQuestions);
  const clampedInitialIdx = Math.min(
    Math.max(0, initialIdx),
    Math.max(0, initialQuestions.length - 1),
  );
  const [idx, setIdx] = useState(clampedInitialIdx);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sprInput, setSprInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctSoFar, setCorrectSoFar] = useState(initialCorrectSoFar);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
  const [restartBusy, setRestartBusy] = useState(false);

  // Restore snapshot on mount for guests. Signed-in users always use server
  // state — refresh reloads the DB attempt.
  useEffect(() => {
    if (!isGuest) {
      setHydrated(true);
      return;
    }
    const snap = readSnapshot<PracticeSnapshot>("practice", sectionKey);
    if (snap && Array.isArray(snap.questions) && snap.questions.length > 0) {
      setQuestions(snap.questions);
      setIdx(Math.min(snap.idx, snap.questions.length - 1));
      setChosen(snap.chosen ?? null);
      setSprInput(snap.sprInput ?? "");
      setRevealed(Boolean(snap.revealed));
      setCorrectSoFar(snap.correctSoFar ?? 0);
      setFinished(Boolean(snap.finished));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist snapshot on every guest state change (after hydration).
  useEffect(() => {
    if (!isGuest || !hydrated) return;
    writeSnapshot<PracticeSnapshot>("practice", sectionKey, {
      questions,
      idx,
      chosen,
      sprInput,
      revealed,
      correctSoFar,
      finished,
    });
  }, [isGuest, hydrated, sectionKey, questions, idx, chosen, sprInput, revealed, correctSoFar, finished]);

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
    if (isGuest) {
      setRevealed(true);
      if (correct) setCorrectSoFar((c) => c + 1);
      return;
    }
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
      if (isGuest) {
        // Track cumulative attempted question IDs across guest quizzes so the
        // dashboard progress bar reflects total section progress.
        const prev =
          readSnapshot<string[]>("section-attempted", sectionKey) ?? [];
        const merged = Array.from(
          new Set([...prev, ...questions.map((qq) => qq.id)]),
        );
        writeSnapshot("section-attempted", sectionKey, merged);
        setFinished(true);
        return;
      }
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

  function startAnotherQuiz() {
    // Wipe the current quiz's runner state so the next mount doesn't try to
    // restore a "finished" attempt. The server hands out a fresh (shuffled)
    // set of questions on reload.
    clearSnapshot("practice", sectionKey);
    leaveTestAndGoTo(window.location.pathname + window.location.search);
  }

  const sprCorrect = isSpr && revealed && checkSprAnswer(sprInput, q.correctChoice);

  if (finished) {
    const total = questions.length;
    const pct = total > 0 ? Math.round((correctSoFar / total) * 100) : 0;
    // Cumulative attempted count is still written to localStorage in next()
    // — it's what the dashboard reads to show real guest progress. We just
    // don't render the section-progress card on this screen.
    const attemptedSoFar =
      (typeof window !== "undefined"
        ? readSnapshot<string[]>("section-attempted", sectionKey)?.length
        : null) ?? questions.length;
    const hasMoreQuizzes = attemptedSoFar < totalSectionQuestions;
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Practice · {sectionName} · Quiz complete
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          You got {correctSoFar} of {total}.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {pct}% on this Quiz of {sectionName}.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {hasMoreQuizzes && (
            <Button variant="brand" size="lg" onClick={startAnotherQuiz}>
              Start another Test  
            </Button>
          )}

          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const guardActive = !finished;

  async function guardSave() {
    // Practice per-answer writes are already server-side. Nothing extra to
    // save — the attempt just stays unsubmitted so it's picked up on resume.
    return;
  }

  async function guardDiscard() {
    if (isGuest) {
      clearSnapshot("practice", sectionKey);
      return;
    }
    if (attemptId) {
      try {
        await discardPracticeAttempt({ attemptId });
      } catch {
        // Swallow — proceed with navigation regardless.
      }
    }
  }

  async function confirmExit() {
    if (restartBusy) return;
    setRestartBusy(true);
    // Reset the current quiz. For signed-in users we finalize the attempt so
    // its per-question answers stay in the DB (dashboard progress bar keeps
    // counting them) but there's no in-progress attempt to resume — next
    // visit hands out a fresh quiz. For guests we clear only the current
    // practice snapshot; the cumulative `section-attempted` list they've
    // built stays intact so the dashboard section progress doesn't drop.
    try {
      if (isGuest) {
        clearSnapshot("practice", sectionKey);
      } else if (attemptId) {
        await finishPracticeAttempt({ attemptId });
      }
    } catch {
      // Swallow — proceed with navigation regardless.
    }
    leaveTestAndGoTo("/dashboard");
  }

  return (
    <div className="space-y-6">
      <LeaveTestGuard
        active={guardActive}
        saveFn={guardSave}
        discardFn={guardDiscard}
      />

      {restartConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-test-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !restartBusy) {
              setRestartConfirmOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-lg p-6">
            <h2 id="exit-test-title" className="text-lg font-semibold">
              Exit this practice quiz?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This quiz will be reset. You&apos;ll get a fresh quiz next time
              you come back to this section.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                variant="brand"
                disabled={restartBusy}
                onClick={confirmExit}
              >
                {restartBusy ? "Exiting…" : "Yes, exit"}
              </Button>
              <Button
                variant="ghost"
                disabled={restartBusy}
                onClick={() => setRestartConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
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
                  ? "w-[calc(100%+3rem)] max-w-none -mx-6 max-h-none md:w-full md:mx-0"
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

          <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => setRestartConfirmOpen(true)}
            >
              Exit practice
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => leaveTestAndGoTo("/dashboard")}
                {...{ [NAV_GUARD_BYPASS_ATTR]: "" }}
              >
                Save and exit
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
