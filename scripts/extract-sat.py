"""
Extract SAT Reading & Writing questions from a College Board Question Bank PDF export.

Auto-detects section (READING or WRITING) per question from the domain label, so
this script handles both `reading-*.pdf` and `writing-*.pdf` exports uniformly.

Input:  data/sat/<name>.pdf
Output: data/sat/<name>.json               — structured questions
        public/questions/sat/<id>.png       — cropped chart image (chart-bearing only)

Usage:
    .venv/bin/python scripts/extract-sat.py \
        [--pdf PATH] [--out PATH] [--images-dir PATH]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path

import pdfplumber
import fitz  # PyMuPDF, for page rendering

# ---------- config ----------

DIFFICULTY_MAP = {"Easy": 1, "Medium": 3, "Hard": 5}
# The metadata-header table alone contributes ~39 rects on every question's first page.
# Chart-bearing pages have 60-100+ shapes; 45 is a safe cutoff empirically.
CHART_SHAPE_THRESHOLD = 45
# Domain → section-key routing. Reading-bucket domains focus on comprehension;
# Writing-bucket domains focus on grammar/style/organization.
DOMAIN_SECTION = {
    "Information and Ideas": "READING",
    "Craft and Structure": "READING",
    "Expression of Ideas": "WRITING",
    "Standard English Conventions": "WRITING",
}
SAT_RW_DOMAINS = list(DOMAIN_SECTION.keys())

QUESTION_ID_RE = re.compile(r"^Question ID:\s*([0-9a-f]{6,})\s*$", re.MULTILINE)
CHOICE_START_RE = re.compile(r"^([A-D])\.\s+(.*)$")
CORRECT_ANSWER_RE = re.compile(r"Correct Answer:\s*([A-D])")
DIFFICULTY_TAIL_RE = re.compile(r"\s+(Easy|Medium|Hard)\s*$")
SENTENCE_END_RE = re.compile(r'[.!?][\'"”’)\]]*\s*$')

# pdfplumber's use_text_flow=True renders rotated chart text (Y-axis labels, etc.)
# as isolated 1-6 char lines. On chart pages we drop chunks shorter than this
# unless they're an SAT blank marker.
CHART_LINE_MIN_CHARS = 50


# ---------- data model ----------


@dataclass
class Choice:
    id: str
    text: str


@dataclass
class Question:
    externalId: str
    sectionKey: str | None  # "READING" | "WRITING", derived from domain
    domain: str | None
    skill: str | None
    difficulty: str | None
    difficultyInt: int
    passage: str | None
    stem: str
    choices: list[Choice]
    correctChoice: str | None
    explanation: str | None
    hasChart: bool
    stemImageUrl: str | None
    sourcePage: int


# ---------- text parsing helpers ----------


_CID_RE = re.compile(r"\(cid:\d+\)")


def _clean(s: str) -> str:
    # Drop pdfplumber "(cid:N)" placeholders emitted when a font glyph has
    # no Unicode mapping.
    s = _CID_RE.sub("", s)
    return re.sub(r"\s+", " ", s).strip()


def _split_paragraphs(text: str) -> list[str]:
    return [_clean(line) for line in text.split("\n") if _clean(line)]


def _parse_metadata_row(block: str) -> tuple[str | None, str | None, str | None]:
    """
    Extract (domain, skill, difficulty) from the metadata data row.

    Under pdfplumber's default extract_text() the row collapses to single spaces:
        "SAT Reading and Writing Information and Ideas Inferences Hard"
    Strategy: locate a known SAT R&W domain string as prefix; the remaining tokens
    up to the trailing Easy|Medium|Hard are the skill.
    """
    m_row = re.search(r"SAT\s+Reading and Writing\s+(.+?)(?:\n|$)", block)
    if not m_row:
        return None, None, None
    tail = _clean(m_row.group(1))
    m_diff = DIFFICULTY_TAIL_RE.search(tail)
    if not m_diff:
        return None, None, None
    difficulty = m_diff.group(1)
    without_diff = tail[: m_diff.start()].strip()
    for dom in SAT_RW_DOMAINS:
        if without_diff.startswith(dom):
            skill = without_diff[len(dom) :].strip()
            return dom, skill or None, difficulty
    return None, without_diff, difficulty


def _split_passage_and_stem(text: str) -> tuple[str | None, str]:
    """
    Split the Question section into (passage, stem). The stem is the question
    ending in '?'. Walk back from the last '?' to the previous sentence-ending
    punctuation followed by a capital letter (so title-embedded '!' like
    "O Pioneers!" isn't mistaken for a sentence boundary). Treat SAT blank marker
    '______' as sentence-final.
    """
    idx = text.rfind("?")
    if idx == -1:
        return None, text.strip()
    prefix = text[:idx]
    stem_start = 0
    for m in re.finditer(r'(?:[.!?][\'"”’)\]]*|_{4,})\s+(?=[A-Z])', prefix):
        stem_start = m.end()
    stem = text[stem_start : idx + 1].strip()
    passage = text[:stem_start].strip() or None
    return passage, stem


def _reconstruct_paragraphs(text: str, drop_chart_noise: bool = False) -> list[str]:
    """
    Merge visual-line chunks into real paragraphs by joining any chunk that
    doesn't end with sentence-terminating punctuation.

    When drop_chart_noise=True, drop chunks that are short and have no sentence
    marker — these are chart axis labels, legend items, and tick numbers.
    """
    chunks = _split_paragraphs(text)
    if drop_chart_noise:
        chunks = [
            c
            for c in chunks
            if len(c) >= CHART_LINE_MIN_CHARS or re.fullmatch(r"_{4,}", c)
        ]
    merged: list[str] = []
    buf = ""
    for c in chunks:
        if buf and not SENTENCE_END_RE.search(buf):
            buf = buf + " " + c
        else:
            if buf:
                merged.append(buf)
            buf = c
    if buf:
        merged.append(buf)
    return merged


def _split_question_body(
    body: str, has_chart: bool
) -> tuple[str | None, str, list[Choice], str | None, str | None]:
    def _section(start_marker: str, end_marker: str | None, end_open: bool = False) -> str:
        """Slice `body` between two headings.

        end_open: when True, the end marker only needs to appear at the start of
        a line (not fill the whole line). Use for markers like "Correct Answer:"
        that have inline content (the answer letter) on the same line.
        """
        m = re.search(rf"(?m)^\s*{re.escape(start_marker)}\s*$", body)
        if not m:
            return ""
        start = m.end()
        if end_marker:
            end_pattern = (
                rf"(?m)^\s*{re.escape(end_marker)}"
                if end_open
                else rf"(?m)^\s*{re.escape(end_marker)}\s*$"
            )
            e = re.search(end_pattern, body[start:])
            if e:
                return body[start : start + e.start()]
        return body[start:]

    question_section = _section("Question", "Answer")
    answer_section = _section("Answer", "Correct Answer:", end_open=True)
    m_correct = CORRECT_ANSWER_RE.search(body)
    correct = m_correct.group(1) if m_correct else None
    rationale_section = _section("Rationale", None)

    paragraphs = _reconstruct_paragraphs(question_section, drop_chart_noise=has_chart)
    full_question = "\n\n".join(paragraphs)
    passage, stem = _split_passage_and_stem(full_question)

    choices = _parse_choices(answer_section)
    explanation_paras = _reconstruct_paragraphs(rationale_section)
    explanation = "\n\n".join(explanation_paras) if explanation_paras else None

    # Source-PDF defect recovery: a few College Board exports omit the "D." prefix
    # on the last choice, so the parser merges it into choice C. If the rationale
    # references "Choice D" and we only have 3 parsed choices, split the last one
    # at its final sentence boundary.
    if len(choices) == 3 and explanation and "Choice D" in explanation:
        last = choices[-1]
        m = list(re.finditer(r"[.!?]\s+(?=[A-Z])", last.text))
        if m:
            split_at = m[-1].end()
            first_half = last.text[:split_at].rstrip()
            second_half = last.text[split_at:].strip()
            if second_half and len(second_half.split()) >= 4:
                choices[-1] = Choice(id=last.id, text=first_half)
                choices.append(Choice(id="D", text=second_half))

    return passage, stem, choices, correct, explanation


def _parse_choices(answer_section: str) -> list[Choice]:
    if not answer_section.strip():
        return []
    lines = answer_section.splitlines()
    choices: list[Choice] = []
    current_id: str | None = None
    current_buf: list[str] = []

    def _flush():
        if current_id is not None:
            text = _clean(" ".join(current_buf))
            if text:
                choices.append(Choice(id=current_id, text=text))

    for raw in lines:
        line = raw.strip()
        m = CHOICE_START_RE.match(line)
        if m:
            _flush()
            current_id = m.group(1)
            current_buf = [m.group(2)]
        elif current_id is not None and line:
            current_buf.append(line)
    _flush()
    return choices


# ---------- chart detection + cropping ----------


def _page_has_chart(page: pdfplumber.page.Page) -> bool:
    n_shapes = len(page.rects) + len(page.lines) + len(page.curves)
    return n_shapes > CHART_SHAPE_THRESHOLD


def _compute_chart_bbox(page: pdfplumber.page.Page) -> tuple[float, float, float, float] | None:
    """
    Bounding box of the chart region: plot-area shapes plus adjacent title/axis
    labels/legend text. Excludes the metadata header (top of page) and the
    passage prose (first wide, long text line below the shapes).
    """
    shapes = [
        (s["x0"], s["top"], s["x1"], s["bottom"])
        for s in list(page.rects) + list(page.lines) + list(page.curves)
        if s["top"] > 120  # skip metadata-header table (extends to y~112)
    ]
    if not shapes:
        return None

    sx0 = min(s[0] for s in shapes)
    sy0 = min(s[1] for s in shapes)
    sx1 = max(s[2] for s in shapes)
    sy1 = max(s[3] for s in shapes)

    # Where does the passage prose begin? First y-row below the shapes with a
    # wide, long text run (chart legend items are short/narrow).
    rows: dict[float, list] = defaultdict(list)
    for c in page.chars:
        if c["top"] > 120:
            y_key = round(c["top"] / 3) * 3
            rows[y_key].append(c)

    passage_top: float | None = None
    for y in sorted(rows.keys()):
        if y <= sy1:
            continue
        text_len = sum(len(c["text"]) for c in rows[y])
        if text_len < 50:
            continue
        xs = [c["x0"] for c in rows[y]] + [c["x1"] for c in rows[y]]
        if max(xs) - min(xs) >= 300:
            passage_top = y
            break

    # Expand top to include chart title just above the shapes. Cap at y=140 so
    # we never pull in the "Question" heading (y~135) or the metadata table.
    # pdfplumber misreports font height for the embedded fonts in these PDFs
    # (returns ~0.9pt when the visible glyph is ~12pt), so extend generously above
    # the reported char top to avoid cutting off ascenders.
    top = sy0
    title_chars = [
        c for c in page.chars
        if 140 < c["top"] < sy0 - 1 and c["top"] > sy0 - 80
    ]
    if title_chars:
        # Never allow top above y=142 — the "Question" heading sits at y~135 and
        # we don't want it in the crop.
        top = max(142, min(top, min(c["top"] for c in title_chars) - 14))

    # Expand left/right for axis labels flanking the plot area.
    left = sx0
    left_flank = [
        c for c in page.chars
        if sy0 - 5 <= c["top"] <= sy1 + 5 and c["x1"] < sx0
    ]
    if left_flank:
        left = min(left, min(c["x0"] for c in left_flank) - 2)

    right = sx1
    right_flank = [
        c for c in page.chars
        if sy0 - 5 <= c["top"] <= sy1 + 5 and c["x0"] > sx1
    ]
    if right_flank:
        right = max(right, max(c["x1"] for c in right_flank) + 2)

    # Expand bottom to include x-axis labels and legend, capped just above passage.
    bottom_cap = passage_top - 5 if passage_top is not None else sy1 + 120
    below = [
        c for c in page.chars
        if sy1 < c["top"] < bottom_cap
        and left - 20 <= c["x0"] and c["x1"] <= right + 20
    ]
    bottom = sy1
    if below:
        # Same font-metric misreporting concern: allow generous space below the
        # reported char bottom so descenders aren't clipped.
        bottom = min(bottom_cap, max(c["bottom"] for c in below) + 6)

    # Small padding.
    pad = 4
    return (
        max(0, left - pad),
        max(0, top - pad),
        min(page.width, right + pad),
        min(page.height, bottom + pad),
    )


def _render_chart_png(
    doc: fitz.Document,
    page_index: int,
    bbox: tuple[float, float, float, float],
    out_path: Path,
    dpi: int = 200,
) -> None:
    page = doc.load_page(page_index)
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    clip = fitz.Rect(*bbox)
    pix = page.get_pixmap(matrix=mat, alpha=False, clip=clip)
    pix.save(out_path.as_posix())


# ---------- extraction ----------


def extract(pdf_path: Path, out_path: Path, images_dir: Path) -> list[Question]:
    images_dir.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    questions: list[Question] = []

    with pdfplumber.open(pdf_path) as pdf:
        num_pages = len(pdf.pages)
        page_texts = [
            pdf.pages[i].extract_text(use_text_flow=True) or "" for i in range(num_pages)
        ]

        full_text_parts: list[str] = []
        page_starts: list[int] = []
        cursor = 0
        for text in page_texts:
            page_starts.append(cursor)
            full_text_parts.append(text)
            cursor += len(text) + 2
            full_text_parts.append("\n\n")
        full_text = "".join(full_text_parts)

        def _page_of(offset: int) -> int:
            lo, hi = 0, len(page_starts) - 1
            while lo < hi:
                mid = (lo + hi + 1) // 2
                if page_starts[mid] <= offset:
                    lo = mid
                else:
                    hi = mid - 1
            return lo

        markers = list(QUESTION_ID_RE.finditer(full_text))
        for idx, m in enumerate(markers):
            external_id = m.group(1)
            block_start = m.end()
            block_end = (
                markers[idx + 1].start() if idx + 1 < len(markers) else len(full_text)
            )
            block = full_text[block_start:block_end]

            domain, skill, difficulty = _parse_metadata_row(block)
            section_key = DOMAIN_SECTION.get(domain or "", None)

            source_page = _page_of(m.start())
            end_page = _page_of(max(block_end - 1, m.start()))

            # Find which page (if any) actually holds the chart.
            chart_page: int | None = None
            for p in range(source_page, end_page + 1):
                if _page_has_chart(pdf.pages[p]):
                    chart_page = p
                    break
            has_chart = chart_page is not None

            passage, stem, choices, correct, explanation = _split_question_body(
                block, has_chart
            )

            stem_image_url = None
            if has_chart and chart_page is not None:
                bbox = _compute_chart_bbox(pdf.pages[chart_page])
                if bbox is not None:
                    out_png = images_dir / f"{external_id}.png"
                    _render_chart_png(doc, chart_page, bbox, out_png)
                    stem_image_url = f"/questions/sat/{external_id}.png"

            questions.append(
                Question(
                    externalId=external_id,
                    sectionKey=section_key,
                    domain=domain,
                    skill=skill,
                    difficulty=difficulty,
                    difficultyInt=DIFFICULTY_MAP.get(difficulty or "", 3),
                    passage=passage,
                    stem=stem,
                    choices=choices,
                    correctChoice=correct,
                    explanation=explanation,
                    hasChart=has_chart,
                    stemImageUrl=stem_image_url,
                    sourcePage=source_page + 1,
                )
            )

    doc.close()

    payload = {
        "sourcePdf": pdf_path.name,
        "count": len(questions),
        "questions": [
            {**asdict(q), "choices": [asdict(c) for c in q.choices]} for q in questions
        ],
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    return questions


# ---------- CLI ----------


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--images-dir", type=Path, default=Path("public/questions/sat"))
    args = ap.parse_args()

    if not args.pdf.exists():
        print(f"error: PDF not found at {args.pdf}", file=sys.stderr)
        return 1

    questions = extract(args.pdf, args.out, args.images_dir)

    from collections import Counter
    section_counts = Counter(q.sectionKey for q in questions)
    n_chart = sum(1 for q in questions if q.hasChart)
    n_missing_correct = sum(1 for q in questions if not q.correctChoice)
    n_bad_choices = sum(1 for q in questions if len(q.choices) != 4)

    print(f"Extracted {len(questions)} questions → {args.out}")
    print(f"  by section:            {dict(section_counts)}")
    print(f"  with chart:            {n_chart}")
    print(f"  missing correctChoice: {n_missing_correct}")
    print(f"  choice count != 4:     {n_bad_choices}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
