"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ClipboardList,
  Copy,
  Lightbulb,
  Save,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ESSAY_PROMPTS } from "./prompts";
import { deleteEssay, saveEssay } from "./actions";

const TARGET_MIN = 350;
const TARGET_MAX = 500;

type SavedEssay = {
  id: string;
  prompt: string;
  text: string;
  wordCount: number;
  readingScore: number | null;
  analysisScore: number | null;
  writingScore: number | null;
  updatedAt: string;
};

type Ratings = {
  reading: number | null;
  analysis: number | null;
  writing: number | null;
};

function parseRatings(input: string): Ratings {
  const cleaned = input.replace(/[*_`~#>]/g, "");
  const grab = (label: string): number | null => {
    const re = new RegExp(`${label}[^\\d\\n]{0,40}(\\d+)`, "i");
    const m = cleaned.match(re);
    if (!m) return null;
    const n = Number(m[1]);
    return n >= 2 && n <= 8 ? n : null;
  };
  return {
    reading: grab("Reading"),
    analysis: grab("Analysis"),
    writing: grab("Writing"),
  };
}

function pickRandomIndex(exclude: number | null): number {
  if (ESSAY_PROMPTS.length <= 1) return 0;
  let idx = Math.floor(Math.random() * ESSAY_PROMPTS.length);
  while (idx === exclude) {
    idx = Math.floor(Math.random() * ESSAY_PROMPTS.length);
  }
  return idx;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function buildRatingPrompt(prompt: string, essay: string): string {
  return [
    "Please rate the following essay using the official SAT Essay rubric.",
    "Score each of the three dimensions on a 2–8 scale:",
    "- Reading — comprehension of the source text / prompt.",
    "- Analysis — evaluation of the author's use of evidence, reasoning, and stylistic elements.",
    "- Writing — cohesion, sentence structure, vocabulary, grammar, and mechanics.",
    "",
    "IMPORTANT — your response MUST begin with these three lines in exactly this format (nothing else on those lines):",
    "Reading: <number 2-8>",
    "Analysis: <number 2-8>",
    "Writing: <number 2-8>",
    "",
    "After those three lines, give one short paragraph of feedback per dimension and 2–3 concrete suggestions to improve.",
    "",
    `Prompt: ${prompt}`,
    "",
    "Essay:",
    essay,
  ].join("\n");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  return score >= 5
    ? "font-bold text-emerald-600"
    : "font-bold text-red-600";
}

function RatingBadges({ ratings }: { ratings: Ratings }) {
  const total =
    (ratings.reading ?? 0) + (ratings.analysis ?? 0) + (ratings.writing ?? 0);
  const cell = "rounded bg-background border px-2 py-0.5 text-xs";
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className={cell}>
        <span className="text-muted-foreground">Reading:</span>{" "}
        <span className={scoreColor(ratings.reading)}>
          {ratings.reading ?? "—"}
        </span>
      </span>
      <span className={cell}>
        <span className="text-muted-foreground">Analysis:</span>{" "}
        <span className={scoreColor(ratings.analysis)}>
          {ratings.analysis ?? "—"}
        </span>
      </span>
      <span className={cell}>
        <span className="text-muted-foreground">Writing:</span>{" "}
        <span className={scoreColor(ratings.writing)}>
          {ratings.writing ?? "—"}
        </span>
      </span>
      <span
        className={cn(
          "rounded px-2 py-0.5 text-xs font-bold",
          total >= 15
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700",
        )}
      >
        Total: {total}/24
      </span>
    </div>
  );
}

export function EssayWriter({
  isSignedIn,
  savedEssays,
  initialPreviewId = null,
}: {
  isSignedIn: boolean;
  savedEssays: SavedEssay[];
  initialPreviewId?: string | null;
}) {
  const [promptIdx, setPromptIdx] = useState<number>(() => pickRandomIndex(null));
  const [text, setText] = useState("");
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(initialPreviewId);
  const [saveStatus, setSaveStatus] = useState<
    { kind: "idle" } | { kind: "error"; message: string } | { kind: "saved"; at: number }
  >({ kind: "idle" });
  const [previewText, setPreviewText] = useState("");
  const [previewSaveStatus, setPreviewSaveStatus] = useState<
    { kind: "idle" } | { kind: "error"; message: string } | { kind: "saved"; at: number }
  >({ kind: "idle" });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [ratings, setRatings] = useState<Ratings | null>(null);
  const [ratingsPasteText, setRatingsPasteText] = useState("");
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const ratingDialogRef = useRef<HTMLDialogElement | null>(null);
  const previewEssay = previewId
    ? savedEssays.find((e) => e.id === previewId) ?? null
    : null;

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (previewEssay && !dlg.open) dlg.showModal();
    if (!previewEssay && dlg.open) dlg.close();
  }, [previewEssay]);

  useEffect(() => {
    const dlg = ratingDialogRef.current;
    if (!dlg) return;
    if (ratingDialogOpen && !dlg.open) dlg.showModal();
    if (!ratingDialogOpen && dlg.open) dlg.close();
  }, [ratingDialogOpen]);

  useEffect(() => {
    if (!previewId) return;
    const essay = savedEssays.find((e) => e.id === previewId);
    if (essay) {
      setPreviewText(essay.text);
      setPreviewSaveStatus({ kind: "idle" });
    }
  }, [previewId]);

  const wordCount = useMemo(() => countWords(text), [text]);
  const prompt = ESSAY_PROMPTS[promptIdx];

  const progressPct = Math.min(100, Math.round((wordCount / TARGET_MAX) * 100));
  const status =
    wordCount === 0
      ? "muted"
      : wordCount < TARGET_MIN
        ? "under"
        : wordCount <= TARGET_MAX
          ? "in-range"
          : "over";

  function newPrompt() {
    setPromptIdx((prev) => pickRandomIndex(prev));
    setCurrentEssayId(null);
    setSaveStatus({ kind: "idle" });
    setRatings(null);
    setRatingsPasteText("");
    setRatingsError(null);
  }

  function clearEssay() {
    if (text && !confirm("Clear your essay? This can't be undone.")) return;
    setText("");
    setCurrentEssayId(null);
    setSaveStatus({ kind: "idle" });
    setRatings(null);
    setRatingsPasteText("");
    setRatingsError(null);
  }

  function applyRatingsPaste(
    pasted: string,
    setter: (r: Ratings | null) => void,
    errorSetter: (s: string | null) => void,
    resetPaste: () => void,
  ) {
    if (!pasted.trim()) return;
    const parsed = parseRatings(pasted);
    if (
      parsed.reading === null ||
      parsed.analysis === null ||
      parsed.writing === null
    ) {
      errorSetter(
        "Couldn't find Reading / Analysis / Writing scores (2–8). Paste the AI's full reply.",
      );
      return;
    }
    setter(parsed);
    errorSetter(null);
    resetPaste();
  }

  async function copyForRating(
    promptText: string,
    body: string,
    setStatus: (s: "idle" | "copied" | "error") => void,
  ) {
    if (!body.trim()) return;
    const payload = buildRatingPrompt(promptText, body);
    try {
      await navigator.clipboard.writeText(payload);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  function savePreview() {
    if (!previewEssay || !previewText.trim() || pending) return;
    const { id, prompt: promptText, readingScore, analysisScore, writingScore } =
      previewEssay;
    startTransition(async () => {
      const res = await saveEssay({
        id,
        prompt: promptText,
        text: previewText,
        readingScore,
        analysisScore,
        writingScore,
      });
      if (!res.ok) {
        setPreviewSaveStatus({ kind: "error", message: res.error });
        return;
      }
      setPreviewSaveStatus({ kind: "saved", at: Date.now() });
    });
  }

  function save() {
    if (!text.trim() || pending) return;
    const r = ratings;
    startTransition(async () => {
      const res = await saveEssay({
        id: currentEssayId,
        prompt,
        text,
        readingScore: r?.reading ?? null,
        analysisScore: r?.analysis ?? null,
        writingScore: r?.writing ?? null,
      });
      if (!res.ok) {
        setSaveStatus({ kind: "error", message: res.error });
        return;
      }
      setCurrentEssayId(res.essay.id);
      setSaveStatus({ kind: "saved", at: Date.now() });
    });
  }

  function removeSaved(id: string) {
    if (!confirm("Delete this saved essay?")) return;
    startTransition(async () => {
      const res = await deleteEssay(id);
      if (!res.ok) {
        setSaveStatus({ kind: "error", message: res.error });
        return;
      }
      if (currentEssayId === id) {
        setCurrentEssayId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg p-4 hover:bg-muted/40">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium">Essay structure tip</span>
              </div>
              <span className="text-xs text-muted-foreground group-open:hidden">
                Show
              </span>
              <span className="hidden text-xs text-muted-foreground group-open:inline">
                Hide
              </span>
            </summary>
            <div className="border-t px-4 pb-4 pt-3 text-sm">
              <p className="mb-3 text-xs text-muted-foreground">
                Use this outline as a scaffold for your five-paragraph response.
              </p>
              <ol className="space-y-3">
                <li>
                  <div className="font-medium">Introduction</div>
                  <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                    <li>Hook</li>
                    <li>Elaboration</li>
                    <li>Thesis statement</li>
                  </ul>
                </li>
                <li>
                  <div className="font-medium">Body paragraph 1</div>
                  <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                    <li>Connector</li>
                    <li>Topic sentence</li>
                    <li>Elaboration</li>
                    <li>Example (L / E / L + E)</li>
                  </ul>
                </li>
                <li>
                  <div className="font-medium">Body paragraph 2</div>
                  <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                    <li>Connector</li>
                    <li>Topic sentence</li>
                    <li>Elaboration</li>
                    <li>Example (L / E / L + E)</li>
                  </ul>
                </li>
                <li>
                  <div className="font-medium">Body paragraph 3</div>
                  <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                    <li>Connector</li>
                    <li>Topic sentence</li>
                    <li>Elaboration</li>
                    <li>Example (L / E / L + E)</li>
                  </ul>
                </li>
                <li>
                  <div className="font-medium">Counterargument</div>
                </li>
                <li>
                  <div className="font-medium">Rebuttal</div>
                </li>
                <li>
                  <div className="font-medium">Conclusion</div>
                  <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                    <li>Connector</li>
                    <li>Revision</li>
                    <li>Ending sentence</li>
                  </ul>
                </li>
              </ol>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg p-4 hover:bg-muted/40">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium">SAT-style scoring rubric</span>
              </div>
              <span className="text-xs text-muted-foreground group-open:hidden">
                Show
              </span>
              <span className="hidden text-xs text-muted-foreground group-open:inline">
                Hide
              </span>
            </summary>
            <div className="border-t p-4 text-sm">
              <p className="mb-3 text-xs text-muted-foreground">
                Essays are marked out of 6 on each criterion. Aim for the 5–6
                column.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="w-40 py-2 pr-3 font-semibold">Criterion</th>
                      <th className="py-2 px-3 font-semibold">
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive">
                          1–2
                        </span>
                      </th>
                      <th className="py-2 px-3 font-semibold">
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          3–4
                        </span>
                      </th>
                      <th className="py-2 pl-3 font-semibold">
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          5–6
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="align-top text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Thesis
                      </td>
                      <td className="py-3 px-3">
                        No or weak thesis statement
                      </td>
                      <td className="py-3 px-3">
                        Thesis statement with a weak road map
                      </td>
                      <td className="py-3 pl-3">
                        Strong thesis with a clear road map
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Organization
                      </td>
                      <td className="py-3 px-3">
                        Content is poorly organized into paragraphs
                      </td>
                      <td className="py-3 px-3">
                        Some paragraphs are organized
                      </td>
                      <td className="py-3 pl-3">
                        All paragraphs are well organized
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Sentence structure
                      </td>
                      <td className="py-3 px-3">
                        Simple and fragmented; short sentences of the same length
                      </td>
                      <td className="py-3 px-3">
                        Mostly short (less fragmented) with some complex sentences
                        and some length variation
                      </td>
                      <td className="py-3 pl-3">
                        Variety of sentence structures
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Language / vocabulary
                      </td>
                      <td className="py-3 px-3">
                        Simple vocabulary; few or no transition words
                      </td>
                      <td className="py-3 px-3">
                        Mix of simple and complex vocabulary; transitions used
                        but could be better placed and more varied
                      </td>
                      <td className="py-3 pl-3">
                        Complex vocabulary; appropriate, well-placed transition
                        words
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Grammar &amp; mechanics
                      </td>
                      <td className="py-3 px-3">
                        Many spelling and grammar errors, run-ons, and fragments
                        — interferes with understanding
                      </td>
                      <td className="py-3 px-3">
                        Some spelling and grammar errors and a few run-ons or
                        fragments — less interference with understanding
                      </td>
                      <td className="py-3 pl-3">
                        Very few spelling or grammar issues, no run-ons or
                        fragments — no interference with understanding
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-foreground">
                        Development of idea / support
                      </td>
                      <td className="py-3 px-3">
                        Did not clearly answer the question; no examples or
                        unclear reasons; little or no connection between thesis
                        and reason/example
                      </td>
                      <td className="py-3 px-3">
                        Answered the question with references to current events,
                        news, or literature; some connection between thesis and
                        examples but not spelled out in each body paragraph
                      </td>
                      <td className="py-3 pl-3">
                        Answered the question with current events, news, or
                        literature examples; clear connection between thesis and
                        reason/example in each body paragraph
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Prompt
            </div>
            <CardTitle className="mt-1 text-lg md:text-xl leading-snug font-medium">
              {prompt}
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={newPrompt}
            className="shrink-0"
          >
            <Shuffle className="w-4 h-4 mr-1.5" />
            New prompt
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your essay</CardTitle>
            <div className="text-sm">
              <span
                className={cn(
                  "font-medium",
                  status === "in-range" && "text-emerald-700",
                  status === "under" && "text-muted-foreground",
                  status === "over" && "text-destructive",
                  status === "muted" && "text-muted-foreground"
                )}
              >
                {wordCount}
              </span>{" "}
              <span className="text-muted-foreground">
                / {TARGET_MIN}–{TARGET_MAX} words
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPct} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing your five-paragraph response here…"
            className="w-full min-h-[420px] rounded-md border bg-background p-4 text-sm leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {status === "in-range" && "Length is in range."}
              {status === "under" &&
                wordCount > 0 &&
                `${TARGET_MIN - wordCount} more word${
                  TARGET_MIN - wordCount === 1 ? "" : "s"
                } to reach the minimum.`}
              {status === "over" &&
                `${wordCount - TARGET_MAX} word${
                  wordCount - TARGET_MAX === 1 ? "" : "s"
                } over the maximum.`}
              {status === "muted" && "Aim for a five-paragraph response."}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEssay}
              disabled={!text || pending}
            >
              Clear
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {saveStatus.kind === "saved" &&
                `Saved · ${new Date(saveStatus.at).toLocaleTimeString()}`}
              {saveStatus.kind === "error" && (
                <span className="text-destructive">{saveStatus.message}</span>
              )}
              {saveStatus.kind === "idle" && currentEssayId && (
                <span>Editing a saved essay — save to update.</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentEssayId && !ratings && (
                <div className="flex items-center gap-1.5 text-xs text-brand">
                  <span>Copy &amp; paste into an AI to get your rating</span>
                  <ArrowRight className="w-4 h-4 animate-nudge-right" />
                </div>
              )}
              {currentEssayId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await copyForRating(prompt, text, setCopyStatus);
                    setRatingsError(null);
                    setRatingDialogOpen(true);
                  }}
                  disabled={!text.trim()}
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  {copyStatus === "copied"
                    ? "Copied!"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : "Copy for AI rating"}
                </Button>
              )}
              {isSignedIn ? (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={save}
                  disabled={!text.trim() || pending}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {pending
                    ? "Saving…"
                    : currentEssayId
                      ? "Update saved essay"
                      : "Save essay"}
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <Link href="/login?callbackUrl=/essay" className="text-brand hover:underline">
                    Sign in
                  </Link>{" "}
                  to save your progress.
                </div>
              )}
            </div>
          </div>
          {currentEssayId && !ratings && (
            <p className="text-xs text-muted-foreground">
              Tip: paste the copied text into ChatGPT, Gemini, or Claude to get
              a rubric-based rating and feedback.
            </p>
          )}

          {ratings && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI rating</span>
                <RatingBadges ratings={ratings} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRatingDialogOpen(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isSignedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your saved essays</CardTitle>
          </CardHeader>
          <CardContent>
            {savedEssays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing saved yet. Hit Save above and your essays will appear here.
              </p>
            ) : (
              <ul className="divide-y">
                {savedEssays.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "flex items-start justify-between gap-3 py-3",
                      currentEssayId === e.id && "bg-brand/5 -mx-3 px-3 rounded"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewId(e.id)}
                      className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="text-sm font-medium truncate">{e.prompt}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {e.wordCount} word{e.wordCount === 1 ? "" : "s"} · saved{" "}
                        {formatDate(e.updatedAt)}
                      </div>
                      {(e.readingScore !== null ||
                        e.analysisScore !== null ||
                        e.writingScore !== null) && (
                        <div className="mt-2">
                          <RatingBadges
                            ratings={{
                              reading: e.readingScore,
                              analysis: e.analysisScore,
                              writing: e.writingScore,
                            }}
                          />
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewId(e.id)}
                        disabled={pending}
                      >
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSaved(e.id)}
                        disabled={pending}
                        aria-label="Delete saved essay"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setPreviewId(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPreviewId(null);
        }}
        className="m-auto w-full max-w-2xl rounded-lg p-0 backdrop:bg-foreground/40"
      >
        {previewEssay && (
          <div className="flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Saved essay
                </div>
                <div className="mt-1 text-base font-medium leading-snug">
                  {previewEssay.prompt}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {countWords(previewText)} word
                  {countWords(previewText) === 1 ? "" : "s"} · saved{" "}
                  {formatDate(previewEssay.updatedAt)}
                </div>
                {(previewEssay.readingScore !== null ||
                  previewEssay.analysisScore !== null ||
                  previewEssay.writingScore !== null) && (
                  <div className="mt-3">
                    <RatingBadges
                      ratings={{
                        reading: previewEssay.readingScore,
                        analysis: previewEssay.analysisScore,
                        writing: previewEssay.writingScore,
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                aria-label="Close"
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <textarea
                value={previewText}
                onChange={(e) => {
                  setPreviewText(e.target.value);
                  if (previewSaveStatus.kind === "saved") {
                    setPreviewSaveStatus({ kind: "idle" });
                  }
                }}
                className="w-full min-h-[320px] resize-y rounded-md border bg-background p-4 text-sm leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-4">
              <div className="text-xs text-muted-foreground">
                {previewSaveStatus.kind === "saved" &&
                  `Saved · ${new Date(previewSaveStatus.at).toLocaleTimeString()}`}
                {previewSaveStatus.kind === "error" && (
                  <span className="text-destructive">
                    {previewSaveStatus.message}
                  </span>
                )}
                {previewSaveStatus.kind === "idle" &&
                  previewText !== previewEssay.text && (
                    <span>Unsaved changes</span>
                  )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    removeSaved(previewEssay.id);
                    setPreviewId(null);
                  }}
                  disabled={pending}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={savePreview}
                  disabled={
                    !previewText.trim() ||
                    previewText === previewEssay.text ||
                    pending
                  }
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {pending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <dialog
        ref={ratingDialogRef}
        onClose={() => setRatingDialogOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setRatingDialogOpen(false);
        }}
        className="m-auto w-full max-w-lg rounded-lg p-0 backdrop:bg-foreground/40"
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                AI rating
              </div>
              <div className="mt-1 text-base font-medium leading-snug">
                Paste the AI&apos;s reply
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {copyStatus === "copied"
                  ? "Prompt copied to clipboard. Paste it into ChatGPT, Gemini, or Claude, then paste the reply below."
                  : "Paste the AI's reply. It should start with Reading: … Analysis: … Writing: …"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRatingDialogOpen(false)}
              aria-label="Close"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 p-5">
            <textarea
              value={ratingsPasteText}
              onChange={(e) => setRatingsPasteText(e.target.value)}
              placeholder={"Reading: 6\nAnalysis: 5\nWriting: 7\n…"}
              className="w-full min-h-[140px] rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            {ratingsError && (
              <p className="text-xs text-destructive">{ratingsError}</p>
            )}
            {ratings && (
              <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 p-3">
                <span className="text-sm font-medium">Applied</span>
                <RatingBadges ratings={ratings} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Reading / Analysis / Writing (each 2–8) are saved with the essay
              when you save.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t p-4">
            <div>
              {ratings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRatings(null);
                    setRatingsError(null);
                  }}
                >
                  Clear rating
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRatingDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  applyRatingsPaste(
                    ratingsPasteText,
                    setRatings,
                    setRatingsError,
                    () => setRatingsPasteText(""),
                  )
                }
                disabled={!ratingsPasteText.trim()}
              >
                Apply rating
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
