"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ESSAY_PROMPTS } from "./prompts";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function TipsGuideContent() {
  return (
    <>
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
    </>
  );
}

export function RubricGuideContent() {
  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Essays are marked out of 6 on each criterion. Aim for the 5–6 column.
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
              <td className="py-3 pr-3 font-medium text-foreground">Thesis</td>
              <td className="py-3 px-3">No or weak thesis statement</td>
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
              <td className="py-3 px-3">Some paragraphs are organized</td>
              <td className="py-3 pl-3">All paragraphs are well organized</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 pr-3 font-medium text-foreground">
                Sentence structure
              </td>
              <td className="py-3 px-3">
                Simple and fragmented; short sentences of the same length
              </td>
              <td className="py-3 px-3">
                Mostly short (less fragmented) with some complex sentences and
                some length variation
              </td>
              <td className="py-3 pl-3">Variety of sentence structures</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 pr-3 font-medium text-foreground">
                Language / vocabulary
              </td>
              <td className="py-3 px-3">
                Simple vocabulary; few or no transition words
              </td>
              <td className="py-3 px-3">
                Mix of simple and complex vocabulary; transitions used but could
                be better placed and more varied
              </td>
              <td className="py-3 pl-3">
                Complex vocabulary; appropriate, well-placed transition words
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 pr-3 font-medium text-foreground">
                Grammar &amp; mechanics
              </td>
              <td className="py-3 px-3">
                Many spelling and grammar errors, run-ons, and fragments,
                interferes with understanding
              </td>
              <td className="py-3 px-3">
                Some spelling and grammar errors and a few run-ons or fragments,
                less interference with understanding
              </td>
              <td className="py-3 pl-3">
                Very few spelling or grammar issues, no run-ons or fragments, no
                interference with understanding
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-3 font-medium text-foreground">
                Development of idea / support
              </td>
              <td className="py-3 px-3">
                Did not clearly answer the question; no examples or unclear
                reasons; little or no connection between thesis and
                reason/example
              </td>
              <td className="py-3 px-3">
                Answered the question with references to current events, news,
                or literature; some connection between thesis and examples but
                not spelled out in each body paragraph
              </td>
              <td className="py-3 pl-3">
                Answered the question with current events, news, or literature
                examples; clear connection between thesis and reason/example in
                each body paragraph
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function openPrintWindow(title: string, bodyHtml: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 32px; line-height: 1.55; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 20px 0 6px; }
    h3 { font-size: 14px; margin: 14px 0 4px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 24px; }
    ol, ul { padding-left: 20px; }
    li { padding: 4px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; font-weight: 600; }
    .card { border: 1px solid #ddd; border-radius: 6px; padding: 12px 14px; margin: 10px 0; }
    .headline { color: #6b21a8; font-weight: 600; font-size: 13px; margin-top: 4px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b21a8; margin-bottom: 4px; }
    .req { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 8px 10px; margin-top: 8px; }
    .warn { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 10px; margin-top: 6px; }
    @media print { body { margin: 16mm; } .noprint { display: none; } }
  </style>
</head>
<body>
${bodyHtml}
<script>window.onload = function(){ window.print(); };<\/script>
</body>
</html>`);
  w.document.close();
}

export function downloadTipsPdf() {
  const body = `
    <h1>HabibEntry, Essay tips</h1>
    <div class="sub">A five-paragraph outline you can use as a scaffold for any prompt.</div>
    <ol>
      <li><strong>Introduction</strong>
        <ul><li>Hook</li><li>Elaboration</li><li>Thesis statement</li></ul>
      </li>
      <li><strong>Body paragraph 1</strong>
        <ul><li>Connector</li><li>Topic sentence</li><li>Elaboration</li><li>Example (L / E / L + E)</li></ul>
      </li>
      <li><strong>Body paragraph 2</strong>
        <ul><li>Connector</li><li>Topic sentence</li><li>Elaboration</li><li>Example (L / E / L + E)</li></ul>
      </li>
      <li><strong>Body paragraph 3</strong>
        <ul><li>Connector</li><li>Topic sentence</li><li>Elaboration</li><li>Example (L / E / L + E)</li></ul>
      </li>
      <li><strong>Counterargument</strong></li>
      <li><strong>Rebuttal</strong></li>
      <li><strong>Conclusion</strong>
        <ul><li>Connector</li><li>Revision</li><li>Ending sentence</li></ul>
      </li>
    </ol>
  `;
  openPrintWindow("HabibEntry, Essay tips", body);
}

export function downloadRubricPdf() {
  const rows: Array<[string, string, string, string]> = [
    [
      "Thesis",
      "No or weak thesis statement",
      "Thesis statement with a weak road map",
      "Strong thesis with a clear road map",
    ],
    [
      "Organization",
      "Content is poorly organized into paragraphs",
      "Some paragraphs are organized",
      "All paragraphs are well organized",
    ],
    [
      "Sentence structure",
      "Simple and fragmented; short sentences of the same length",
      "Mostly short (less fragmented) with some complex sentences and some length variation",
      "Variety of sentence structures",
    ],
    [
      "Language / vocabulary",
      "Simple vocabulary; few or no transition words",
      "Mix of simple and complex vocabulary; transitions used but could be better placed and more varied",
      "Complex vocabulary; appropriate, well-placed transition words",
    ],
    [
      "Grammar & mechanics",
      "Many spelling and grammar errors, run-ons, and fragments, interferes with understanding",
      "Some spelling and grammar errors and a few run-ons or fragments, less interference with understanding",
      "Very few spelling or grammar issues, no run-ons or fragments, no interference with understanding",
    ],
    [
      "Development of idea / support",
      "Did not clearly answer the question; no examples or unclear reasons; little or no connection between thesis and reason/example",
      "Answered the question with references to current events, news, or literature; some connection between thesis and examples but not spelled out in each body paragraph",
      "Answered the question with current events, news, or literature examples; clear connection between thesis and reason/example in each body paragraph",
    ],
  ];
  const rowsHtml = rows
    .map(
      ([c, low, mid, high]) =>
        `<tr><td><strong>${escapeHtml(c)}</strong></td><td>${escapeHtml(low)}</td><td>${escapeHtml(mid)}</td><td>${escapeHtml(high)}</td></tr>`,
    )
    .join("");
  const body = `
    <h1>HabibEntry, Essay grading rubric</h1>
    <div class="sub">Essays are marked out of 6 on each criterion. Aim for the 5–6 column.</div>
    <table>
      <thead>
        <tr><th>Criterion</th><th>1–2</th><th>3–4</th><th>5–6</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
  openPrintWindow("HabibEntry, Essay grading rubric", body);
}

export function downloadPromptsPdf() {
  const w = window.open("", "_blank");
  if (!w) return;
  const items = ESSAY_PROMPTS.map(
    (p, i) => `<li><span class="n">${i + 1}.</span> ${escapeHtml(p)}</li>`,
  ).join("");
  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HabibEntry, Essay prompts</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 32px; line-height: 1.55; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 24px; }
    ol { list-style: none; padding: 0; margin: 0; }
    li { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .n { color: #888; margin-right: 8px; font-weight: 600; }
    @media print { body { margin: 16mm; } .noprint { display: none; } }
  </style>
</head>
<body>
  <h1>HabibEntry, Essay prompts</h1>
  <div class="sub">A collection of prompts that may appear on the test. Practice writing five-paragraph responses of ~350–500 words.</div>
  <ol>${items}</ol>
  <script>window.onload = function(){ window.print(); };<\/script>
</body>
</html>`);
  w.document.close();
}

export function PromptsGuideBody() {
  return (
    <ol className="space-y-2">
      {ESSAY_PROMPTS.map((p, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-md border bg-background p-3 text-sm leading-relaxed"
        >
          <span className="shrink-0 font-semibold text-muted-foreground">
            {i + 1}.
          </span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  );
}

export function PromptsGuideFooterActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t p-4">
      <p className="text-xs text-muted-foreground">
        Download opens a printable view, use your browser&apos;s Save as PDF.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button variant="brand" size="sm" onClick={downloadPromptsPdf}>
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
