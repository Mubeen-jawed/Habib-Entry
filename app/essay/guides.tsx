"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ESSAY_PROMPTS } from "./prompts";

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

async function createPdf() {
  const [{ jsPDF }] = await Promise.all([import("jspdf")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;

  let y = margin;

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text: string) {
    ensureSpace(28);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(17, 17, 17);
    doc.text(text, margin, y);
    y += 14;
  }

  function subtext(text: string) {
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * 14 + 6);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 12;
  }

  function bullet(text: string, indent = 0, bold = false) {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    const x = margin + indent * 16;
    const textX = x + 12;
    const lines = doc.splitTextToSize(text, maxWidth - indent * 16 - 12);
    ensureSpace(lines.length * 15);
    doc.setFillColor(17, 17, 17);
    if (indent === 0) {
      doc.circle(x + 3, y - 3.5, 1.6, "F");
    } else {
      doc.setDrawColor(17, 17, 17);
      doc.setLineWidth(0.6);
      doc.circle(x + 3, y - 3.5, 1.6, "S");
    }
    doc.text(lines, textX, y);
    y += lines.length * 15;
  }

  function paragraph(text: string, bold = false, gapAfter = 4) {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * 15 + gapAfter);
    doc.text(lines, margin, y);
    y += lines.length * 15 + gapAfter;
  }

  return { doc, heading, subtext, bullet, paragraph, ensureSpace, margin, maxWidth };
}

export async function downloadTipsPdf() {
  const { doc, heading, subtext, bullet, paragraph } = await createPdf();
  heading("Imtehan, Essay tips");
  subtext("A five-paragraph outline you can use as a scaffold for any prompt.");

  const sections: Array<{ title: string; items?: string[] }> = [
    { title: "Introduction", items: ["Hook", "Elaboration", "Thesis statement"] },
    {
      title: "Body paragraph 1",
      items: ["Connector", "Topic sentence", "Elaboration", "Example (L / E / L + E)"],
    },
    {
      title: "Body paragraph 2",
      items: ["Connector", "Topic sentence", "Elaboration", "Example (L / E / L + E)"],
    },
    {
      title: "Body paragraph 3",
      items: ["Connector", "Topic sentence", "Elaboration", "Example (L / E / L + E)"],
    },
    { title: "Counterargument" },
    { title: "Rebuttal" },
    {
      title: "Conclusion",
      items: ["Connector", "Revision", "Ending sentence"],
    },
  ];

  sections.forEach((section, i) => {
    paragraph(`${i + 1}. ${section.title}`, true, 2);
    section.items?.forEach((item) => bullet(item, 1));
  });

  doc.save("imtehan-essay-tips.pdf");
}

export async function downloadRubricPdf() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 17, 17);
  doc.text("Imtehan, Essay grading rubric", margin, margin);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Essays are marked out of 6 on each criterion. Aim for the 5-6 column.",
    margin,
    margin + 18,
  );

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
      "Mostly short with some complex sentences and some length variation",
      "Variety of sentence structures",
    ],
    [
      "Language / vocabulary",
      "Simple vocabulary; few or no transition words",
      "Mix of simple and complex vocabulary; transitions used but could be better placed",
      "Complex vocabulary; appropriate, well-placed transition words",
    ],
    [
      "Grammar & mechanics",
      "Many spelling and grammar errors, run-ons, and fragments; interferes with understanding",
      "Some spelling and grammar errors and a few run-ons or fragments",
      "Very few spelling or grammar issues; no run-ons or fragments",
    ],
    [
      "Development of idea / support",
      "Did not clearly answer the question; no examples or unclear reasons",
      "Answered with references to current events, news, or literature; some connection to thesis",
      "Clear connection between thesis and reason/example in each body paragraph",
    ],
  ];

  autoTable(doc, {
    startY: margin + 36,
    head: [["Criterion", "1-2", "3-4", "5-6"]],
    body: rows,
    styles: {
      font: "times",
      fontSize: 10,
      cellPadding: 6,
      valign: "top",
      textColor: [17, 17, 17],
    },
    headStyles: {
      fillColor: [107, 33, 168],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 100 },
    },
    margin: { left: margin, right: margin },
  });

  doc.save("imtehan-essay-grading-rubric.pdf");
}

export async function downloadPromptsPdf() {
  const { doc, heading, subtext, paragraph } = await createPdf();
  heading("Imtehan, Essay prompts");
  subtext(
    "A collection of prompts that may appear on the test. Practice writing five-paragraph responses of ~350-500 words.",
  );

  ESSAY_PROMPTS.forEach((prompt, i) => {
    paragraph(`${i + 1}. ${prompt}`, false, 8);
  });

  doc.save("imtehan-essay-prompts.pdf");
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
