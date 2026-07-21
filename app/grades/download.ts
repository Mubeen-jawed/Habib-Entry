"use client";

import {
  INTERNATIONAL_BOARD,
  NATIONAL_BOARD,
  type Scholarship,
} from "./data";

export async function downloadScholarshipsPdf() {
  const { jsPDF } = await import("jspdf");
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

  function writeText(
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      italic?: boolean;
      color?: [number, number, number];
      gapAfter?: number;
      indent?: number;
    } = {},
  ) {
    const {
      size = 12,
      bold = false,
      italic = false,
      color = [17, 17, 17],
      gapAfter = 4,
      indent = 0,
    } = opts;
    const style = bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";
    doc.setFont("times", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const x = margin + indent;
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    ensureSpace(lines.length * (size + 3) + gapAfter);
    doc.text(lines, x, y);
    y += lines.length * (size + 3) + gapAfter;
  }

  function drawCard(scholarship: Scholarship) {
    writeText(scholarship.name, { bold: true, size: 13, gapAfter: 2 });
    writeText(scholarship.headline, {
      bold: true,
      size: 11,
      color: [107, 33, 168],
      gapAfter: 6,
    });
    writeText(scholarship.details, { size: 11, gapAfter: 8 });

    writeText("GRADE REQUIREMENT", {
      bold: true,
      size: 9,
      color: [107, 33, 168],
      gapAfter: 2,
    });
    if (typeof scholarship.requirement === "string") {
      writeText(scholarship.requirement, { size: 11, gapAfter: 6 });
    } else {
      writeText(`AKUEB: ${scholarship.requirement.akueb}`, {
        size: 11,
        gapAfter: 2,
      });
      writeText(`Other Boards: ${scholarship.requirement.otherBoards}`, {
        size: 11,
        gapAfter: 6,
      });
    }

    if (scholarship.ifNotMet) {
      writeText("IF REQUIREMENT NOT MET", {
        bold: true,
        size: 9,
        color: [180, 83, 9],
        gapAfter: 2,
      });
      writeText(scholarship.ifNotMet, {
        size: 11,
        color: [107, 65, 20],
        gapAfter: 6,
      });
    }

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + maxWidth, y);
    y += 12;
  }

  function drawGroup(title: string, description: string, list: Scholarship[]) {
    writeText(title, { bold: true, size: 15, gapAfter: 2 });
    writeText(description, { italic: true, size: 11, color: [90, 90, 90], gapAfter: 10 });
    list.forEach(drawCard);
    y += 6;
  }

  writeText("HabibEntry, Grades & scholarships", {
    bold: true,
    size: 20,
    gapAfter: 4,
  });
  writeText(
    "Habib University merit- and need-based scholarship programs.",
    { italic: true, size: 11, color: [90, 90, 90], gapAfter: 16 },
  );

  drawGroup(
    "International Examination Board Applicants",
    "For applicants sitting O/A Levels, IB, or equivalent international boards.",
    INTERNATIONAL_BOARD,
  );
  drawGroup(
    "National Examination Board Applicants",
    "For applicants sitting Matric, FSc, or equivalent national boards.",
    NATIONAL_BOARD,
  );

  doc.save("habibentry-grades-scholarships.pdf");
}
