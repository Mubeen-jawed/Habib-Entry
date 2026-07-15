"""
Extract SAT Math questions from a College Board Question Bank PDF export.

Math questions differ fundamentally from Reading/Writing:
  - Equations in the stem, choices, and rationale are vector-drawn, not text.
  - Choices are frequently image-only (the "A." label sits alone with the choice
    rendered as a figure to the right).
  - Some questions are MCQ (A/B/C/D); others are SPR (Student-Produced Response
    with a numeric answer, no choices).

Strategy: locate landmark headings ("Question", "Answer", "A."/"B."/"C."/"D.",
"Correct Answer:", "Rationale") by y-position and crop each region as a PNG. Text
is stored where reliably available (metadata: domain / skill / difficulty; the
correctChoice letter or numeric answer). Choice text is left empty; the image
carries the content.

Input:  data/sat/maths-50.pdf
Output: data/sat/maths.json                       — question metadata + image paths
        public/questions/sat/math/<id>-stem.png   — stem + any figure
        public/questions/sat/math/<id>-<A|B|C|D>.png — choice images (MCQ)
        public/questions/sat/math/<id>-rationale.png — rationale image
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
import fitz


DIFFICULTY_MAP = {"Easy": 1, "Medium": 3, "Hard": 5}
SAT_MATH_DOMAINS = [
    "Algebra",
    "Advanced Math",
    "Problem-Solving and Data Analysis",
    "Geometry and Trigonometry",
]
DIFFICULTY_WORDS = ("Easy", "Medium", "Hard")

QUESTION_ID_RE = re.compile(r"^Question ID:\s*([0-9a-f]{6,})\s*$", re.MULTILINE)
CORRECT_ANSWER_RE = re.compile(r"Correct Answer:\s*(.+?)(?:\n|$)")
CHOICE_LETTERS = ["A", "B", "C", "D"]
# A "landmark" text-line is one whose stripped content equals a fixed keyword.
LANDMARK_KEYWORDS = {"Question", "Answer", "Rationale", "A.", "B.", "C.", "D."}

# Horizontal crop bounds — leave small margins.
CROP_X0 = 18.0
CROP_X1 = 594.0
# Two separate paddings:
#   GLYPH_ASCENT: pdfplumber understates char `top` by ~10-11pt for the embedded
#     fonts in these PDFs. Expand upward from a landmark's reported top by this
#     amount to include the visual glyph, and pull the bottom of the previous
#     band up by the same amount so the next landmark's glyph doesn't leak in.
#   HEADING_GAP: tiny margin below/above a heading like "Question" or "Answer"
#     when using the heading as a section boundary.
GLYPH_ASCENT = 14.0
HEADING_GAP = 2.0


@dataclass
class Choice:
    id: str
    text: str
    imageUrl: str | None = None


@dataclass
class MathQuestion:
    externalId: str
    sectionKey: str
    questionType: str  # "MCQ" | "SPR"
    domain: str | None
    skill: str | None
    difficulty: str | None
    difficultyInt: int
    stem: str  # best-effort text (equations missing) — image is authoritative
    choices: list[Choice]
    correctChoice: str  # "A|B|C|D" for MCQ, numeric string for SPR
    stemImageUrl: str | None
    explanationImageUrl: str | None
    sourcePage: int


# ---------- text helpers ----------


_CID_RE = re.compile(r"\(cid:\d+\)")
_AXIS_TOKEN_RE = re.compile(r"^-?\d+(?:\.\d+)?$|^[xy]$|^O$")


def _clean(s: str) -> str:
    # Drop pdfplumber "(cid:N)" placeholders that appear when a font glyph has
    # no Unicode mapping (most often the minus sign in axis labels).
    s = _CID_RE.sub("", s)
    s = re.sub(r"\s+", " ", s).strip()
    # Graph axis labels sometimes leak into the stem text as a run of numbers
    # and single-letter axis names before the actual prose. If 5+ leading
    # whitespace-separated tokens are axis-like, drop them.
    tokens = s.split(" ")
    i = 0
    while i < len(tokens) and _AXIS_TOKEN_RE.match(tokens[i]):
        i += 1
    if i >= 5:
        s = " ".join(tokens[i:])
    return s.strip()


def _parse_metadata(block_lines: list[str]) -> tuple[str | None, str | None, str | None]:
    """
    Parse (domain, skill, difficulty) from the metadata rows. Under
    use_text_flow=True the row wraps: e.g.
        "SAT Math Algebra Systems of two linear"
        "equations in two"
        "variables"
        "Hard"
    Concatenate until we hit "Question", then look for domain + difficulty.
    """
    header_seen = False
    collected: list[str] = []
    for line in block_lines:
        s = line.strip()
        if not s:
            continue
        if s.startswith("Assessment "):
            header_seen = True
            continue
        if not header_seen:
            continue
        if s == "Question":
            break
        collected.append(s)
    if not collected:
        return None, None, None

    row_text = " ".join(collected)
    # Difficulty is one of Easy/Medium/Hard; it appears at the end.
    diff = None
    for w in DIFFICULTY_WORDS:
        m = re.search(rf"\b{w}\b\s*$", row_text)
        if m:
            diff = w
            row_text = row_text[: m.start()].strip()
            break
    # Strip the assessment/test prefix.
    row_text = re.sub(r"^SAT\s+Math\s+", "", row_text).strip()
    # Match a known domain as prefix.
    domain: str | None = None
    skill: str | None = None
    for dom in SAT_MATH_DOMAINS:
        if row_text.startswith(dom):
            domain = dom
            skill = row_text[len(dom) :].strip() or None
            break
    return domain, skill, diff


# ---------- landmark discovery ----------


@dataclass
class Landmark:
    keyword: str
    page: int  # 0-based
    top: float  # y-position (from top)
    bottom: float


def _find_landmarks(pdf: pdfplumber.PDF, start_page: int, end_page: int) -> list[Landmark]:
    """
    Find landmark heading positions across the pages of one question.
    A landmark = a text line whose stripped content matches one of LANDMARK_KEYWORDS
    or "Correct Answer:".
    """
    landmarks: list[Landmark] = []
    for pi in range(start_page, end_page + 1):
        p = pdf.pages[pi]
        rows: dict[float, list] = defaultdict(list)
        for c in p.chars:
            y_key = round(c["top"] / 2) * 2
            rows[y_key].append(c)
        for y in sorted(rows.keys()):
            chars = sorted(rows[y], key=lambda c: c["x0"])
            text = "".join(c["text"] for c in chars).strip()
            top = min(c["top"] for c in chars)
            bottom = max(c["bottom"] for c in chars)
            if text in LANDMARK_KEYWORDS:
                landmarks.append(Landmark(text, pi, top, bottom))
            elif text.startswith("Correct Answer:"):
                landmarks.append(Landmark("Correct Answer:", pi, top, bottom))
    return landmarks


# ---------- region → image ----------


def _crop_band(
    doc: fitz.Document,
    page_index: int,
    y0: float,
    y1: float,
    out_path: Path,
    dpi: int = 200,
) -> None:
    page = doc.load_page(page_index)
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    clip = fitz.Rect(CROP_X0, y0, CROP_X1, y1)
    pix = page.get_pixmap(matrix=mat, alpha=False, clip=clip)
    pix.save(out_path.as_posix())


# ---------- extraction ----------


def extract(pdf_path: Path, out_path: Path, images_dir: Path) -> list[MathQuestion]:
    images_dir.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    questions: list[MathQuestion] = []

    with pdfplumber.open(pdf_path) as pdf:
        num_pages = len(pdf.pages)
        page_texts = [
            pdf.pages[i].extract_text(use_text_flow=True) or "" for i in range(num_pages)
        ]

        # Locate each question's start page by scanning for the Question ID line.
        starts: list[tuple[str, int]] = []  # (externalId, page_index)
        for pi, text in enumerate(page_texts):
            for m in QUESTION_ID_RE.finditer(text):
                starts.append((m.group(1), pi))

        for idx, (ext_id, start_page) in enumerate(starts):
            end_page = starts[idx + 1][1] - 1 if idx + 1 < len(starts) else num_pages - 1
            # If two questions share a page, end_page < start_page. Clamp.
            end_page = max(end_page, start_page)

            block_lines = []
            for pi in range(start_page, end_page + 1):
                block_lines.extend(page_texts[pi].split("\n"))

            domain, skill, difficulty = _parse_metadata(block_lines)

            # Correct Answer text-line value.
            correct_raw: str | None = None
            for line in block_lines:
                m = CORRECT_ANSWER_RE.search(line)
                if m:
                    correct_raw = _clean(m.group(1))
                    break
            question_type = "MCQ" if correct_raw in CHOICE_LETTERS else "SPR"

            # Best-effort stem text (missing equations).
            stem_text = _extract_section_text(block_lines, "Question", ("Answer", "Correct Answer:")) or ""

            landmarks = _find_landmarks(pdf, start_page, end_page)
            page_bottom = pdf.pages[start_page].height

            # --- crop stem image ---
            question_mark = _first_landmark(landmarks, "Question")
            answer_mark = _first_landmark(landmarks, "Answer") if question_type == "MCQ" else None
            correct_mark = _first_landmark(landmarks, "Correct Answer:")

            stem_image_url: str | None = None
            if question_mark is not None:
                stem_top = question_mark.bottom + HEADING_GAP
                if answer_mark is not None and answer_mark.page == question_mark.page:
                    stem_bottom = answer_mark.top - GLYPH_ASCENT
                elif correct_mark is not None and correct_mark.page == question_mark.page:
                    stem_bottom = correct_mark.top - GLYPH_ASCENT
                else:
                    stem_bottom = page_bottom - 20
                if stem_bottom - stem_top > 20:
                    stem_png = images_dir / f"{ext_id}-stem.png"
                    _crop_band(doc, question_mark.page, stem_top, stem_bottom, stem_png)
                    stem_image_url = f"/questions/sat/math/{ext_id}-stem.png"

            # --- crop each MCQ choice image ---
            choices: list[Choice] = []
            if question_type == "MCQ":
                letter_marks = {L: _first_landmark(landmarks, f"{L}.") for L in CHOICE_LETTERS}
                for i, L in enumerate(CHOICE_LETTERS):
                    mark = letter_marks[L]
                    if mark is None:
                        choices.append(Choice(id=L, text="", imageUrl=None))
                        continue
                    top = mark.top - GLYPH_ASCENT
                    # Bottom = start of next choice letter, else Correct Answer:, else page bottom.
                    next_mark = None
                    for nxt in CHOICE_LETTERS[i + 1 :]:
                        candidate = letter_marks[nxt]
                        if candidate is not None and candidate.page == mark.page:
                            next_mark = candidate
                            break
                    if next_mark is not None:
                        bottom = next_mark.top - GLYPH_ASCENT
                    elif correct_mark is not None and correct_mark.page == mark.page:
                        bottom = correct_mark.top - GLYPH_ASCENT
                    else:
                        bottom = pdf.pages[mark.page].height - 20
                    if bottom - top > 10:
                        choice_png = images_dir / f"{ext_id}-{L}.png"
                        _crop_band(doc, mark.page, top, bottom, choice_png)
                        choices.append(
                            Choice(id=L, text="", imageUrl=f"/questions/sat/math/{ext_id}-{L}.png")
                        )
                    else:
                        choices.append(Choice(id=L, text="", imageUrl=None))

            # --- crop rationale image (first page of rationale only for MVP) ---
            rationale_mark = _first_landmark(landmarks, "Rationale")
            explanation_image_url: str | None = None
            if rationale_mark is not None:
                r_top = rationale_mark.bottom + HEADING_GAP
                r_bottom = pdf.pages[rationale_mark.page].height - 20
                # If the next question starts on this same page, cap the rationale.
                # (Rare for math, but handle it.)
                next_question_start_on_same_page = (
                    idx + 1 < len(starts)
                    and starts[idx + 1][1] == rationale_mark.page
                )
                if next_question_start_on_same_page:
                    # Find the "Question ID:" y-position on this page.
                    for c in pdf.pages[rationale_mark.page].chars:
                        # rough sentinel: the QID row is at y ~ 33
                        pass
                if r_bottom - r_top > 20:
                    rationale_png = images_dir / f"{ext_id}-rationale.png"
                    _crop_band(doc, rationale_mark.page, r_top, r_bottom, rationale_png)
                    explanation_image_url = f"/questions/sat/math/{ext_id}-rationale.png"

            # Correct choice: letter for MCQ, numeric string for SPR.
            correct_choice = correct_raw or ""

            questions.append(
                MathQuestion(
                    externalId=ext_id,
                    sectionKey="MATH",
                    questionType=question_type,
                    domain=domain,
                    skill=skill,
                    difficulty=difficulty,
                    difficultyInt=DIFFICULTY_MAP.get(difficulty or "", 3),
                    stem=_clean(stem_text),
                    choices=choices,
                    correctChoice=correct_choice,
                    stemImageUrl=stem_image_url,
                    explanationImageUrl=explanation_image_url,
                    sourcePage=start_page + 1,
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


def _extract_section_text(
    block_lines: list[str], start_keyword: str, end_keywords: tuple[str, ...]
) -> str | None:
    """Concatenate lines between start_keyword and the first end_keyword we see."""
    started = False
    out: list[str] = []
    for line in block_lines:
        s = line.strip()
        if not started:
            if s == start_keyword:
                started = True
            continue
        if s in end_keywords or s.startswith("Correct Answer:"):
            break
        if s:
            out.append(s)
    return " ".join(out) if out else None


def _first_landmark(landmarks: list[Landmark], keyword: str) -> Landmark | None:
    for L in landmarks:
        if L.keyword == keyword:
            return L
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--images-dir", type=Path, default=Path("public/questions/sat/math"))
    args = ap.parse_args()

    if not args.pdf.exists():
        print(f"error: PDF not found at {args.pdf}", file=sys.stderr)
        return 1

    questions = extract(args.pdf, args.out, args.images_dir)

    from collections import Counter
    n_mcq = sum(1 for q in questions if q.questionType == "MCQ")
    n_spr = sum(1 for q in questions if q.questionType == "SPR")
    n_missing_correct = sum(1 for q in questions if not q.correctChoice)
    n_missing_stem_img = sum(1 for q in questions if not q.stemImageUrl)
    domain_counts = Counter(q.domain for q in questions)
    print(f"Extracted {len(questions)} questions → {args.out}")
    print(f"  MCQ / SPR:              {n_mcq} / {n_spr}")
    print(f"  missing correctChoice:  {n_missing_correct}")
    print(f"  missing stem image:     {n_missing_stem_img}")
    print(f"  by domain:              {dict(domain_counts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
