"use client";

import {
  INTERNATIONAL_BOARD,
  NATIONAL_BOARD,
  type Scholarship,
} from "./data";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderScholarship(s: Scholarship): string {
  const requirement =
    typeof s.requirement === "string"
      ? `<p>${escapeHtml(s.requirement)}</p>`
      : `<div><strong>AKUEB:</strong> ${escapeHtml(s.requirement.akueb)}</div>
         <div style="margin-top:4px"><strong>Other Boards:</strong> ${escapeHtml(s.requirement.otherBoards)}</div>`;

  const notMet = s.ifNotMet
    ? `<div class="warn"><div class="label" style="color:#b45309">If requirement not met</div>${escapeHtml(s.ifNotMet)}</div>`
    : "";

  return `
    <div class="card">
      <div><strong>${escapeHtml(s.name)}</strong></div>
      <div class="headline">${escapeHtml(s.headline)}</div>
      <p style="margin-top:8px">${escapeHtml(s.details)}</p>
      <div class="req"><div class="label">Grade requirement</div>${requirement}</div>
      ${notMet}
    </div>
  `;
}

function renderGroup(title: string, description: string, list: Scholarship[]) {
  return `
    <h2>${escapeHtml(title)}</h2>
    <div class="sub">${escapeHtml(description)}</div>
    ${list.map(renderScholarship).join("")}
  `;
}

export function downloadScholarshipsPdf() {
  const w = window.open("", "_blank");
  if (!w) return;
  const body = `
    <h1>HabibEntry, Grades &amp; scholarships</h1>
    <div class="sub">Habib University merit- and need-based scholarship programs.</div>
    ${renderGroup(
      "International Examination Board Applicants",
      "For applicants sitting O/A Levels, IB, or equivalent international boards.",
      INTERNATIONAL_BOARD,
    )}
    ${renderGroup(
      "National Examination Board Applicants",
      "For applicants sitting Matric, FSc, or equivalent national boards.",
      NATIONAL_BOARD,
    )}
  `;
  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HabibEntry, Grades & scholarships</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 32px; line-height: 1.55; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 20px 0 6px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 16px; }
    .card { border: 1px solid #ddd; border-radius: 6px; padding: 12px 14px; margin: 10px 0; font-size: 13px; }
    .headline { color: #6b21a8; font-weight: 600; font-size: 13px; margin-top: 4px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b21a8; margin-bottom: 4px; font-weight: 600; }
    .req { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 8px 10px; margin-top: 8px; }
    .warn { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 10px; margin-top: 6px; }
    @media print { body { margin: 16mm; } .noprint { display: none; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
${body}
<script>window.onload = function(){ window.print(); };<\/script>
</body>
</html>`);
  w.document.close();
}
