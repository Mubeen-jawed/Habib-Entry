import type { Tone } from "@/lib/tones";

export type SeoLandingSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type SeoLandingLink = {
  label: string;
  href: string;
};

export type SeoLandingPage = {
  slug: string;
  keyword: string;
  eyebrow: string;
  eyebrowTone: Tone;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: SeoLandingSection[];
  relatedLinks: SeoLandingLink[];
  ctaLabel?: string;
};

const REGISTER_CTA = "Start practicing free";

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: "habib-mock-test",
    keyword: "Habib mock test",
    eyebrow: "Habib mock test",
    eyebrowTone: "lavender",
    metaTitle: "Habib mock test — full-length, timed practice for the HU entry exam",
    metaDescription:
      "Take a Habib mock test that mirrors the real Habib University entrance exam — same sections, same timing, per-question explanations after you submit.",
    h1: "A Habib mock test that behaves like the real exam",
    intro:
      "A good mock test isn't about the questions — it's about the pressure. The Habib entrance exam is computer-based, adaptive, and timed section by section, so the only preparation that really transfers is a mock that reproduces those conditions. Imtehan's mocks are built to that spec.",
    sections: [
      {
        heading: "What's inside a mock",
        paragraphs: [
          "Every mock runs the four sections you'll see on test day: Arithmetic, Quantitative Reasoning (with Advanced Algebra & Functions for DSSE), Reading, and Writing, plus a timed Essay. Section timers behave like the real thing — once you enter a section, the clock doesn't stop.",
        ],
      },
      {
        heading: "What you get after you submit",
        bullets: [
          "Per-section score bands mapped to Habib's public cutoffs.",
          "Per-question explanations, not just answer keys.",
          "A weak-topic breakdown so you know what to drill next.",
          "Your attempt is saved so you can compare mocks over time.",
        ],
      },
      {
        heading: "When to take your first one",
        paragraphs: [
          "Take a diagnostic mock before you start studying, not after. It will feel bad. That's the point — you want the score floor before you've done any work, so your improvement curve is honest and you can prioritise the section that's actually costing you the offer.",
        ],
      },
    ],
    relatedLinks: [
      { label: "See the full test breakdown", href: "/test" },
      { label: "Practice by section", href: "/register" },
      { label: "Try a free essay prompt", href: "/essay" },
    ],
  },
  {
    slug: "habib-entry-test-pattern",
    keyword: "Habib entry test pattern",
    eyebrow: "Test pattern",
    eyebrowTone: "sky",
    metaTitle: "Habib entry test pattern — sections, timing, question counts",
    metaDescription:
      "The Habib entry test pattern explained: sections, timing, question counts, and how DSSE and AHSS differ. Updated for the current admissions cycle.",
    h1: "The Habib entry test pattern, in one page",
    intro:
      "The Habib entry test is a computer-based Accuplacer plus a proctored essay. It's not one long exam — it's four short adaptive sections, each with its own timer, followed by a written response. Knowing the pattern before you sit down removes half the stress on test day.",
    sections: [
      {
        heading: "The sections you'll see",
        bullets: [
          "Arithmetic — fractions, decimals, percentages, ratios, basic word problems.",
          "Quantitative Reasoning, Algebra & Statistics — linear equations, systems, data interpretation.",
          "Advanced Algebra & Functions — DSSE applicants only; quadratics, exponents, functions, trig.",
          "Reading — passage-based comprehension and inference.",
          "Writing — sentence edits, grammar, and rhetorical structure.",
          "Essay — a proctored, timed response to a single prompt.",
        ],
      },
      {
        heading: "DSSE vs AHSS",
        paragraphs: [
          "Both schools share Reading, Writing, and the Essay. The only real split is math: DSSE sits Arithmetic + Quantitative Reasoning + Advanced Algebra & Functions, while AHSS sits Arithmetic + Quantitative Reasoning only. Advanced Algebra is the section that decides most DSSE offers.",
        ],
      },
      {
        heading: "How the timing feels on the day",
        paragraphs: [
          "The Accuplacer sections are adaptive, which means the test picks the next question based on how you answered the last one. You cannot skip and come back. Move steadily — spending five minutes on question one is how most applicants lose their score.",
        ],
      },
    ],
    relatedLinks: [
      { label: "DSSE test breakdown", href: "/schools/dsse" },
      { label: "AHSS test breakdown", href: "/schools/ahss" },
      { label: "Take a timed mock", href: "/register" },
    ],
  },
  {
    slug: "habib-test-preparation",
    keyword: "Habib test preparation",
    eyebrow: "Preparation",
    eyebrowTone: "lavender",
    metaTitle: "Habib test preparation — a section-by-section study plan",
    metaDescription:
      "How to prepare for the Habib University entrance test: a four-week study plan, diagnostic-first, focused on the section that's costing you the offer.",
    h1: "Habib test preparation, done section by section",
    intro:
      "Most Habib applicants over-prepare Reading and under-prepare math, then wonder why the offer didn't come. Real preparation is diagnostic-first: figure out which section is actually holding your score down, then spend the majority of your time there.",
    sections: [
      {
        heading: "Week one — the diagnostic mock",
        paragraphs: [
          "Take one full-length mock in the first week. Don't study for it. The point is to establish a floor. The mock will show you exactly which section is the bottleneck, which is almost always different from what you assumed.",
        ],
      },
      {
        heading: "Weeks two and three — kill the bottleneck",
        paragraphs: [
          "Spend 70% of your remaining time on your weakest section. It's the only way to move your overall score. Alternate short practice sets with review — the review is where the learning happens, not in the practice itself.",
        ],
      },
      {
        heading: "Week four — timing, essay, interview",
        paragraphs: [
          "Take two more full-length mocks, one week apart. Spend the rest of the week on the essay and interview — both are underweighted in most preparation plans and both are recoverable in a week if you actually practise them.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Take a diagnostic mock", href: "/register" },
      { label: "Practice the essay", href: "/essay" },
      { label: "Book a mock interview", href: "/interview" },
    ],
  },
  {
    slug: "habib-entry-test",
    keyword: "Habib entry test",
    eyebrow: "The exam",
    eyebrowTone: "sky",
    metaTitle: "Habib entry test — what it is, what's on it, how it's scored",
    metaDescription:
      "The Habib entry test explained: what Habib University measures, which sections you sit, what the essay looks like, and how the exam is scored.",
    h1: "The Habib entry test, explained",
    intro:
      "The Habib entry test is how Habib University decides whether you're ready for the university's core curriculum. It's not an aptitude test in disguise — it's a real reading, writing, and quantitative reasoning exam, and Habib pays attention to per-section scores, not just the total.",
    sections: [
      {
        heading: "What's actually on it",
        paragraphs: [
          "Four short computer-based sections — Arithmetic, Quantitative Reasoning, Reading, Writing — plus Advanced Algebra & Functions for DSSE applicants, and a timed essay. The whole thing runs on the Accuplacer platform, which is used by universities across North America.",
        ],
      },
      {
        heading: "What Habib is measuring",
        paragraphs: [
          "The math sections test whether you can work fluently with numbers under pressure. Reading and Writing test whether you can hold a paragraph in your head. The essay is where they look for real thinking — not vocabulary, not perfect grammar, but a coherent argument.",
        ],
      },
      {
        heading: "Where students trip up",
        bullets: [
          "Rushing math and misreading the operator — the adaptive engine punishes it hard.",
          "Writing an essay full of quotes and no argument.",
          "Assuming Reading is easy because they read English every day.",
          "Skipping the interview prep because the offer feels close.",
        ],
      },
    ],
    relatedLinks: [
      { label: "See the section breakdown", href: "/test" },
      { label: "DSSE vs AHSS", href: "/#schools" },
      { label: "Start free practice", href: "/register" },
    ],
  },
  {
    slug: "accuplacer-practice-test",
    keyword: "Accuplacer practice test",
    eyebrow: "Accuplacer",
    eyebrowTone: "butter",
    metaTitle: "Accuplacer practice test for Habib University applicants",
    metaDescription:
      "Habib University's entrance exam runs on the Accuplacer. Free Accuplacer practice test with explanations, section timing, and per-question feedback.",
    h1: "Accuplacer practice test, tuned for Habib applicants",
    intro:
      "Habib runs the Accuplacer, the same computer-adaptive test that dozens of North American universities use for placement. That's good news for anyone preparing — there's a lot of authentic practice material out there, and the format doesn't change from year to year.",
    sections: [
      {
        heading: "Why the Accuplacer matters",
        paragraphs: [
          "Because the Accuplacer is adaptive, one wrong answer early can drop your section score more than a wrong answer late. The engine is trying to converge on your ability level. If you get to the point where every question feels hard, that's a good sign — it means you're being tested at your ceiling, not below it.",
        ],
      },
      {
        heading: "Sections you'll practise",
        bullets: [
          "Arithmetic — the entry-level math section, mandatory for both schools.",
          "Quantitative Reasoning, Algebra & Statistics — the mid-tier math section.",
          "Advanced Algebra & Functions — DSSE only, and often the section that decides the offer.",
          "Reading — comprehension, inference, and vocabulary in context.",
          "Writing — sentence-level editing and rhetorical control.",
        ],
      },
      {
        heading: "How to practise like it's real",
        paragraphs: [
          "Time every session. Don't check the answer until you've committed to yours. Review is more valuable than practice — if you don't understand why the correct answer is correct, you haven't learned the question.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start Accuplacer practice", href: "/register" },
      { label: "Full test breakdown", href: "/test" },
      { label: "DSSE requirements", href: "/schools/dsse" },
    ],
  },
  {
    slug: "accuplacer-math-practice",
    keyword: "Accuplacer math practice",
    eyebrow: "Accuplacer math",
    eyebrowTone: "butter",
    metaTitle: "Accuplacer math practice — Arithmetic, QAS, and AAF",
    metaDescription:
      "Accuplacer math practice for the Habib entrance test — Arithmetic, Quantitative Reasoning, and Advanced Algebra & Functions with per-question explanations.",
    h1: "Accuplacer math practice for Habib",
    intro:
      "There are three Accuplacer math sections, and Habib requires either two or all three depending on your school. Practising them as one blob is a mistake — each has its own topic list, question style, and pacing, and you should drill them separately.",
    sections: [
      {
        heading: "Arithmetic",
        paragraphs: [
          "The most under-prepared section, because everyone assumes it's easy. It isn't. Fractions with mixed operations, percentage change, ratios, and word problems come up in every mock. If your Arithmetic score sags, everything else in math collapses with it.",
        ],
      },
      {
        heading: "Quantitative Reasoning, Algebra & Statistics",
        paragraphs: [
          "Linear equations, systems, exponents, basic geometry, and data interpretation. This is the section AHSS applicants live and die by, and it's still worth 33% of DSSE math. Practise mixed sets, not topic-by-topic — mixing forces the retrieval that the real test demands.",
        ],
      },
      {
        heading: "Advanced Algebra & Functions",
        paragraphs: [
          "DSSE-only. Quadratics, polynomial and rational expressions, exponents and logs, trigonometry, and function analysis. This is where DSSE offers are actually decided. If your AAF is below the cutoff, no amount of Arithmetic will save the application.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start math practice", href: "/register" },
      { label: "DSSE math requirements", href: "/schools/dsse" },
      { label: "AHSS math requirements", href: "/schools/ahss" },
    ],
  },
  {
    slug: "accuplacer-english-practice",
    keyword: "Accuplacer English practice",
    eyebrow: "Accuplacer English",
    eyebrowTone: "mint",
    metaTitle: "Accuplacer English practice — Reading and Writing",
    metaDescription:
      "Accuplacer English practice for the Habib entrance exam. Reading passages, writing edits, and per-question feedback tuned to Habib's cutoff bands.",
    h1: "Accuplacer English practice — Reading and Writing",
    intro:
      "The Accuplacer English sections are underestimated by nearly every Habib applicant whose first language is English. The passages are harder than they look, and the writing section rewards structural thinking, not just grammar.",
    sections: [
      {
        heading: "Reading — what the passages actually test",
        paragraphs: [
          "You'll see literary, historical, and scientific passages. The questions are less about facts in the passage and more about the shape of the argument — main idea, tone, implication, and the relationship between paragraphs. Vocabulary-in-context questions look easy and are where most students lose an easy point.",
        ],
      },
      {
        heading: "Writing — sentence edits and rhetorical structure",
        paragraphs: [
          "Two flavours of question: micro-level edits (grammar, punctuation, word choice) and macro-level revisions (adding, cutting, or reordering a sentence for rhetorical effect). Students strong in grammar often bomb the second type because it needs a reader's ear, not a rule book.",
        ],
      },
      {
        heading: "How to build both under time",
        paragraphs: [
          "Read passages first, in full, before touching questions. Every skimmer's shortcut costs more time on re-reads than it saves. On Writing, learn to ask 'what is this paragraph trying to do?' — the answer to that question determines the correct edit more often than any grammar rule.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start English practice", href: "/register" },
      { label: "Practice the essay", href: "/essay" },
      { label: "See the test breakdown", href: "/test" },
    ],
  },
  {
    slug: "accuplacer-reading-questions",
    keyword: "Accuplacer reading questions",
    eyebrow: "Accuplacer reading",
    eyebrowTone: "sky",
    metaTitle: "Accuplacer reading questions — passage types and question stems",
    metaDescription:
      "Walk through the types of Accuplacer reading questions you'll see on the Habib entrance test, with strategies for each passage type and stem.",
    h1: "Accuplacer reading questions, walked through",
    intro:
      "There are only a handful of question types on the Accuplacer reading section. Once you can name the type of question you're looking at, half of your answer is already chosen. Below are the ones that come up most, with a note on how to attack each.",
    sections: [
      {
        heading: "Passage types",
        bullets: [
          "Literary narrative — a short story excerpt, often 19th-century prose.",
          "Historical / social — an argumentative essay on a political or historical topic.",
          "Natural science — an explanatory passage with a technical claim.",
          "Paired passages — two short passages you're asked to compare.",
        ],
      },
      {
        heading: "Question stems you'll see repeatedly",
        bullets: [
          "\"The primary purpose of the passage is…\" — go to the last paragraph first.",
          "\"The author most likely believes that…\" — attitude, not fact.",
          "\"In line X, the word Y most nearly means…\" — always re-read the sentence in context.",
          "\"Which choice best supports the answer to the previous question?\" — the two are graded as a pair.",
        ],
      },
      {
        heading: "Strategy on the day",
        paragraphs: [
          "Read the passage in full before touching questions. If you skim, you'll answer three fast questions and then spend eight minutes on the fourth trying to reconstruct the argument you skipped. Slow is smooth, smooth is fast.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start reading practice", href: "/register" },
      { label: "See the reading section on the test", href: "/test" },
      { label: "AHSS test breakdown", href: "/schools/ahss" },
    ],
  },
  {
    slug: "accuplacer-writing-practice",
    keyword: "Accuplacer writing practice",
    eyebrow: "Accuplacer writing",
    eyebrowTone: "pink",
    metaTitle: "Accuplacer writing practice — grammar, structure, rhetoric",
    metaDescription:
      "Accuplacer writing practice for the Habib entrance test. Sentence-level edits and rhetorical revisions with worked explanations.",
    h1: "Accuplacer writing practice",
    intro:
      "The Accuplacer writing section is not a grammar test. It's a rhetorical revision test with grammar folded in. The applicants who score highest are the ones who read paragraphs like editors — always asking what the paragraph is doing, not just what it says.",
    sections: [
      {
        heading: "What the writing section actually measures",
        bullets: [
          "Standard English conventions — punctuation, agreement, modifiers.",
          "Sentence structure — coordination, subordination, parallelism.",
          "Word choice — precision, register, redundancy.",
          "Organisation — sentence order, transitions, paragraph unity.",
        ],
      },
      {
        heading: "Traps that catch strong writers",
        paragraphs: [
          "The commonest trap is 'more is better' — the shortest grammatical option is usually the correct one. Another: assuming the current sentence order is right because it reads fine aloud; the test rewards edits that improve flow, not edits that avoid it.",
        ],
      },
      {
        heading: "Timing",
        paragraphs: [
          "Aim for one minute per question on your first pass. If a question needs more, flag it and move on. The section is short and adaptive, so getting to every question in time matters more than nailing a single tough revision.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start writing practice", href: "/register" },
      { label: "Practice the essay", href: "/essay" },
      { label: "See the test breakdown", href: "/test" },
    ],
  },
  {
    slug: "habib-math-practice",
    keyword: "Habib math practice",
    eyebrow: "Math practice",
    eyebrowTone: "butter",
    metaTitle: "Habib math practice — arithmetic to advanced algebra",
    metaDescription:
      "Habib University math practice covering Arithmetic, Quantitative Reasoning, and Advanced Algebra & Functions with per-question explanations.",
    h1: "Habib math practice, from arithmetic to advanced",
    intro:
      "Math is where most Habib offers are decided. The exam covers three separately scored math sections, and Habib publishes per-section thresholds — so a monster Arithmetic score cannot rescue a weak Advanced Algebra score. Practising as one blob doesn't work.",
    sections: [
      {
        heading: "What Habib math actually covers",
        bullets: [
          "Arithmetic — fractions, decimals, percentages, ratios, word problems.",
          "Algebra — linear equations, systems, inequalities, exponents, quadratics.",
          "Functions — evaluating, transforming, and interpreting function behaviour.",
          "Trigonometry — right-triangle trig and unit-circle basics (DSSE only).",
          "Statistics — mean, median, mode, and reading data displays.",
        ],
      },
      {
        heading: "How to structure your math prep",
        paragraphs: [
          "Diagnose first. Take a section-by-section mock and look at which of the three math sections has the biggest gap to Habib's cutoff. That's where you spend most of your time. Rotating between topics daily beats hammering one topic for a week — spaced retrieval is what makes the material stick.",
        ],
      },
      {
        heading: "DSSE vs AHSS math",
        paragraphs: [
          "AHSS applicants sit Arithmetic and QAS only. DSSE applicants sit all three math sections, including Advanced Algebra & Functions. If you're applying to DSSE and haven't done trig or logs in a year, that gap is your first priority.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start math practice", href: "/register" },
      { label: "DSSE math requirements", href: "/schools/dsse" },
      { label: "Take a full-length mock", href: "/test" },
    ],
  },
  {
    slug: "habib-arithmetic-questions",
    keyword: "Habib arithmetic questions",
    eyebrow: "Arithmetic",
    eyebrowTone: "butter",
    metaTitle: "Habib arithmetic questions — fractions, percentages, ratios",
    metaDescription:
      "The Habib arithmetic questions you'll see, the topics they cover, and where most applicants leak easy marks. Free practice with explanations.",
    h1: "Habib arithmetic questions, without the guesswork",
    intro:
      "Arithmetic is the section people practise last and lose marks on first. It's not because the math is hard — it's because the questions are short and reward mechanical fluency, and if you're rusty on fractions and percentages, you'll spend twice as long and still miss.",
    sections: [
      {
        heading: "Topics that show up every time",
        bullets: [
          "Operations with fractions, mixed numbers, and decimals.",
          "Percentages — percent change, percent of, reverse percentages.",
          "Ratios and proportions in real-life word problems.",
          "Order of operations with signed numbers.",
          "Basic estimation and rounding under time pressure.",
        ],
      },
      {
        heading: "Question styles you'll see",
        paragraphs: [
          "Two flavours: raw calculation and word-problem translation. Raw calculation is about not making a silly mistake — most applicants can do the math, but not in 40 seconds. Word problems are about parsing the sentence into an equation quickly, which is a skill on its own.",
        ],
      },
      {
        heading: "Where students lose easy marks",
        paragraphs: [
          "Rushing the first three questions. The Accuplacer is adaptive — the first questions decide which difficulty band you drop into, and rushing an early one to save 20 seconds costs 40 marks on the section score. Move fast, but not faster than you can read.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start arithmetic practice", href: "/register" },
      { label: "See the full math breakdown", href: "/test" },
      { label: "Advanced math for DSSE", href: "/schools/dsse" },
    ],
  },
  {
    slug: "habib-advanced-math",
    keyword: "Habib advanced math",
    eyebrow: "Advanced math",
    eyebrowTone: "peach",
    metaTitle: "Habib advanced math — Advanced Algebra & Functions for DSSE",
    metaDescription:
      "Habib advanced math practice for the DSSE entrance test — quadratics, functions, exponents, logs, and trigonometry with explained solutions.",
    h1: "Habib advanced math for DSSE applicants",
    intro:
      "DSSE applicants sit an extra math section — Advanced Algebra & Functions — and it's the one that quietly decides most offers. Habib's public cutoffs make it clear: below the AAF threshold, a strong overall score isn't enough.",
    sections: [
      {
        heading: "Topics on Advanced Algebra & Functions",
        bullets: [
          "Quadratic equations, factoring, and completing the square.",
          "Polynomial and rational expressions.",
          "Exponential and logarithmic equations.",
          "Function notation, composition, and transformation.",
          "Right-triangle trigonometry and unit-circle basics.",
          "Systems of equations, including non-linear.",
        ],
      },
      {
        heading: "How to prep advanced math without wasting weeks",
        paragraphs: [
          "Don't try to relearn a year of textbook math. Take a diagnostic, identify the two or three topic families where you're losing marks, and drill those. Twenty focused practice problems per topic, with the solution reviewed line by line, moves the needle faster than a hundred mixed problems.",
        ],
      },
      {
        heading: "Trig — the topic people avoid until it's too late",
        paragraphs: [
          "If you haven't touched trigonometry since school, don't wait for test week. Right-triangle trig, the unit circle, and the basic identities are all that's tested — a weekend is enough to become fluent, but only if you start when you have a weekend to spare.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start advanced math practice", href: "/register" },
      { label: "DSSE test breakdown", href: "/schools/dsse" },
      { label: "Trig question practice", href: "/habib-trigonometry-questions" },
    ],
  },
  {
    slug: "habib-trigonometry-questions",
    keyword: "Habib trigonometry questions",
    eyebrow: "Trigonometry",
    eyebrowTone: "peach",
    metaTitle: "Habib trigonometry questions — right triangles, unit circle, identities",
    metaDescription:
      "Habib trigonometry questions for the DSSE entrance test. Right-triangle trig, unit circle, and identity practice with worked solutions.",
    h1: "Habib trigonometry questions for DSSE",
    intro:
      "The trigonometry that shows up on the Habib DSSE test is a narrow, well-defined set. You do not need calculus-adjacent trig identities — you need to be quick and reliable on right triangles and the unit circle, and to recognise the two or three identities that come up in every mock.",
    sections: [
      {
        heading: "What actually gets tested",
        bullets: [
          "Sin, cos, tan definitions in right triangles.",
          "The 30–60–90 and 45–45–90 special triangles.",
          "Unit-circle values in radians and degrees.",
          "The Pythagorean identity and reciprocal identities.",
          "Basic sum, difference, and double-angle recognition.",
        ],
      },
      {
        heading: "What is not tested",
        paragraphs: [
          "You will not see graph transformations of trig functions, inverse trig, or heavy identity manipulation. If you're revising and hit a topic that feels like a maths olympiad question, it's the wrong topic. Come back to the fundamentals.",
        ],
      },
      {
        heading: "How to memorise the unit circle for keeps",
        paragraphs: [
          "Draw it out five days in a row. On day six, draw it from memory. That's the whole method — it's the drawing that fixes it in memory, not staring at a printed one. Do it before you touch a practice question and you'll save minutes per section.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start trig practice", href: "/register" },
      { label: "Advanced math for DSSE", href: "/habib-advanced-math" },
      { label: "DSSE test breakdown", href: "/schools/dsse" },
    ],
  },
  {
    slug: "habib-algebra-questions",
    keyword: "Habib algebra questions",
    eyebrow: "Algebra",
    eyebrowTone: "butter",
    metaTitle: "Habib algebra questions — linear, quadratic, systems",
    metaDescription:
      "Habib algebra questions for the entry test — linear equations, systems, quadratics, and inequalities with per-question explanations.",
    h1: "Habib algebra questions — the ones that decide the section",
    intro:
      "Algebra is the connective tissue of the Habib math sections. Whether you're on Arithmetic word problems, Quantitative Reasoning systems, or Advanced Algebra function questions, the same algebraic fluency shows up. Getting fast at algebra is the highest-leverage math skill you can build.",
    sections: [
      {
        heading: "Topics tested",
        bullets: [
          "Linear equations and inequalities in one and two variables.",
          "Systems of linear equations, both algebraic and graphical.",
          "Quadratics — factoring, the quadratic formula, completing the square.",
          "Exponent rules and simplifying radicals.",
          "Polynomial and rational expressions.",
        ],
      },
      {
        heading: "The two question forms that come up most",
        paragraphs: [
          "Pure symbolic manipulation ('solve for x') and translated word problems ('a plumber charges…'). Both need the same underlying algebra, but the translation step is where marks are actually lost. Practise word problems specifically, not just symbolic sets.",
        ],
      },
      {
        heading: "Where students lose marks",
        paragraphs: [
          "Sign errors, distribution mistakes, and misreading exponents. All of them are avoidable. Write out one line per algebraic step for the first two weeks of practice — the muscle memory carries over even when you stop showing your work.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Start algebra practice", href: "/register" },
      { label: "Advanced math for DSSE", href: "/habib-advanced-math" },
      { label: "Arithmetic practice", href: "/habib-arithmetic-questions" },
    ],
  },
  {
    slug: "habib-persuasive-essay",
    keyword: "Habib persuasive essay",
    eyebrow: "Persuasive essay",
    eyebrowTone: "pink",
    metaTitle: "Habib persuasive essay — thesis, structure, and rubric fit",
    metaDescription:
      "How to write a Habib persuasive essay under exam conditions — thesis-first structure, argument-driven paragraphs, and rubric-aligned examples.",
    h1: "Habib persuasive essay — how to argue on the page",
    intro:
      "The Habib essay is a persuasive essay, not a five-paragraph school essay. The rubric rewards a clear argument, real reasoning, and control over structure. It penalises hedging, quote-stuffing, and paragraphs that describe rather than argue.",
    sections: [
      {
        heading: "Thesis first, always",
        paragraphs: [
          "Your first paragraph should state the position you're arguing for in one sentence, and preview the two or three reasons you'll build on. Readers of admissions essays decide within 30 seconds whether the essay has a spine — if the thesis is missing, the rest reads as fog.",
        ],
      },
      {
        heading: "Argument-driven paragraphs",
        paragraphs: [
          "Each body paragraph should make one argument, back it up with one concrete example, and connect it back to the thesis. That's the structure — not description, not narrative. If a paragraph could be cut and the essay still made sense, it wasn't argumentative to begin with.",
        ],
      },
      {
        heading: "What the rubric actually rewards",
        bullets: [
          "A specific, arguable thesis — not a summary of both sides.",
          "Evidence that comes from your own experience or real knowledge.",
          "A counter-argument, briefly considered and answered.",
          "A conclusion that says something new, not a rewritten intro.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Practise the essay", href: "/essay" },
      { label: "See rubric-scored examples", href: "/habib-essay-examples" },
      { label: "Essay writing practice", href: "/habib-essay-writing-practice" },
    ],
  },
  {
    slug: "habib-mock-exam-free",
    keyword: "Habib mock exam free",
    eyebrow: "Free mock",
    eyebrowTone: "mint",
    metaTitle: "Habib mock exam — free full-length practice with explanations",
    metaDescription:
      "Take a free Habib mock exam that mirrors the real Habib University entrance test. Section timers, per-question explanations, saved attempts.",
    h1: "Free Habib mock exam, no card required",
    intro:
      "You should not have to pay to sit a mock. Imtehan runs a free full-length Habib mock exam on the same platform as our other practice — same sections, same timing, same review flow. Register, sit it, learn from the review.",
    sections: [
      {
        heading: "What's free",
        bullets: [
          "A full-length mock across all four Accuplacer sections.",
          "A timed essay prompt from the same bank the real exam draws from.",
          "Per-question explanations after you submit.",
          "Saved attempt so you can compare against your next mock.",
        ],
      },
      {
        heading: "How to make it count",
        paragraphs: [
          "Sit it in one uninterrupted block. No phone, no notes, no going back mid-section. The point of the free mock is to reproduce the pressure of the real thing — if you break the pressure, the score doesn't tell you anything useful.",
        ],
      },
      {
        heading: "What comes after",
        paragraphs: [
          "Review every question you got wrong, and half the questions you got right by guessing. Then take another mock a week later. Two full-length mocks with real review teach more than a month of untimed practice sets.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Register and start the mock", href: "/register" },
      { label: "See the test breakdown", href: "/test" },
      { label: "Book a mock interview", href: "/interview" },
    ],
  },
  {
    slug: "habib-essay-writing-practice",
    keyword: "Habib essay writing practice",
    eyebrow: "Essay practice",
    eyebrowTone: "pink",
    metaTitle: "Habib essay writing practice — real prompts, timed, with feedback",
    metaDescription:
      "Habib essay writing practice with real prompts, timed conditions, and structured feedback across reading, analysis, and writing.",
    h1: "Habib essay writing practice",
    intro:
      "The essay is the most recoverable component of the Habib application. It's also the one applicants leave until last. A week of real, timed essay practice — three prompts, one review each — moves the essay score more than a month of reading essay guides.",
    sections: [
      {
        heading: "How the practice should be structured",
        paragraphs: [
          "Set a timer. Pick a prompt. Write for the same duration the real essay allows. Submit and read the feedback carefully — not just the score, but the notes on reading comprehension, analysis, and writing. Then pick a different prompt and go again in three days.",
        ],
      },
      {
        heading: "Prompt types you'll see",
        bullets: [
          "Argumentative — take a position on a debatable question.",
          "Reflective — respond to a quote or short passage.",
          "Comparative — weigh two ideas against each other.",
        ],
      },
      {
        heading: "What to focus on in review",
        paragraphs: [
          "Look at whether your thesis is specific and arguable. Look at whether each paragraph makes an argument or just describes. Look at your conclusion — did it earn the space, or was it filler? Those three questions cover 80% of the marks the rubric gives out.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Practise the essay now", href: "/essay" },
      { label: "See rubric-scored examples", href: "/habib-essay-examples" },
      { label: "Persuasive essay structure", href: "/habib-persuasive-essay" },
    ],
  },
  {
    slug: "habib-admission-interview-preparation",
    keyword: "Habib admission interview preparation",
    eyebrow: "Interview prep",
    eyebrowTone: "mint",
    metaTitle: "Habib admission interview preparation — free mock interviews",
    metaDescription:
      "Free Habib admission interview preparation with current students who have been through the real HU interview. Book a one-on-one mock.",
    h1: "Habib admission interview preparation",
    intro:
      "The Habib admission interview is not a technical exam. It's a conversation about who you are, why you want to be at Habib, and how you think. The applicants who do best in it are the ones who have already had the conversation once, with someone who was recently on the other side of the table.",
    sections: [
      {
        heading: "What they actually ask",
        bullets: [
          "Why Habib, and why this school (DSSE or AHSS).",
          "A story from your life that shaped how you think.",
          "A time you disagreed with someone and how you handled it.",
          "What you'd study first if you had a free summer.",
          "One question about the world that keeps you up at night.",
        ],
      },
      {
        heading: "What to prepare, without over-preparing",
        paragraphs: [
          "Do not memorise answers. Interviewers can hear it. Instead, know the three stories from your life you want to reach for, and know why those stories matter. Then trust yourself to hold a conversation. The best interviews sound like conversations, not recitals.",
        ],
      },
      {
        heading: "The free mock interview program",
        paragraphs: [
          "Imtehan runs a free one-on-one mock interview program with current Habib students, gender-matched, over video call. Sessions are booked after your entrance test date is confirmed. Sign up early — slots are first-come, first-served.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Book a free mock interview", href: "/interview" },
      { label: "See the full test breakdown", href: "/test" },
      { label: "Practise the essay", href: "/essay" },
    ],
  },
  {
    slug: "habib-university-dsse-entry-test-preparation",
    keyword: "Habib University DSSE entry test preparation",
    eyebrow: "DSSE prep",
    eyebrowTone: "sky",
    metaTitle: "Habib University DSSE entry test preparation",
    metaDescription:
      "Habib University DSSE entry test preparation — Advanced Algebra & Functions, essay, interview, and full-length mocks tuned to DSSE cutoffs.",
    h1: "Habib University DSSE entry test preparation",
    intro:
      "DSSE — the Dhanani School of Science and Engineering — sits three math sections instead of two, and Advanced Algebra & Functions is where most DSSE offers are decided. Preparation that ignores this ends up strong on the sections that don't matter.",
    sections: [
      {
        heading: "What DSSE tests",
        bullets: [
          "Arithmetic — mandatory, but low weight.",
          "Quantitative Reasoning, Algebra & Statistics — mid-tier math.",
          "Advanced Algebra & Functions — the deciding section.",
          "Reading and Writing — same as AHSS.",
          "Essay — a proctored, timed response to a single prompt.",
        ],
      },
      {
        heading: "Where to spend your time",
        paragraphs: [
          "Take a diagnostic mock, then look at Advanced Algebra & Functions. If your AAF score is below Habib's public cutoff for the section, that's the only thing you should be studying for the next two weeks. Everything else can wait.",
        ],
      },
      {
        heading: "Don't skip the essay and interview",
        paragraphs: [
          "DSSE applicants over-index on math and under-prepare the qualitative components. A weak essay can undo a strong AAF score. Give the essay and interview a week of real, structured practice — not the leftover hours the night before.",
        ],
      },
    ],
    relatedLinks: [
      { label: "DSSE full breakdown", href: "/schools/dsse" },
      { label: "Advanced math practice", href: "/habib-advanced-math" },
      { label: "Book a mock interview", href: "/interview" },
    ],
  },
  {
    slug: "habib-university-ahss-test-preparation",
    keyword: "Habib University AHSS test preparation",
    eyebrow: "AHSS prep",
    eyebrowTone: "peach",
    metaTitle: "Habib University AHSS test preparation",
    metaDescription:
      "Habib University AHSS test preparation — reading, writing, essay, and quantitative reasoning practice with per-question feedback and mocks.",
    h1: "Habib University AHSS test preparation",
    intro:
      "AHSS — the School of Arts, Humanities and Social Sciences — puts more weight on reading, writing, and the essay than DSSE does, and it doesn't require Advanced Algebra. Preparation should reflect that mix, not clone the DSSE plan.",
    sections: [
      {
        heading: "What AHSS tests",
        bullets: [
          "Arithmetic — the entry-level math section.",
          "Quantitative Reasoning, Algebra & Statistics — the mid-tier math section.",
          "Reading — passage-based comprehension, inference, and vocabulary.",
          "Writing — sentence edits and rhetorical revision.",
          "Essay — the qualitative centre of the AHSS application.",
        ],
      },
      {
        heading: "Where AHSS applicants leave marks on the table",
        paragraphs: [
          "The essay. AHSS applicants often assume they can write and skip essay practice altogether. The rubric is specific — thesis, argument, evidence, counter-argument, conclusion — and general writing skill doesn't automatically hit it. Practise it timed, three times minimum.",
        ],
      },
      {
        heading: "Math still matters",
        paragraphs: [
          "You don't sit Advanced Algebra, but you do sit Arithmetic and QAS, and both are graded against a Habib cutoff. Don't zero out math prep because you're applying to AHSS. A week of arithmetic and algebra practice usually clears the AHSS math thresholds cleanly.",
        ],
      },
    ],
    relatedLinks: [
      { label: "AHSS full breakdown", href: "/schools/ahss" },
      { label: "Essay writing practice", href: "/habib-essay-writing-practice" },
      { label: "Reading question practice", href: "/accuplacer-reading-questions" },
    ],
  },
  {
    slug: "habib-scholarship-test",
    keyword: "Habib scholarship test",
    eyebrow: "Scholarships",
    eyebrowTone: "butter",
    metaTitle: "Habib scholarship test — grades, entrance score, and financial aid",
    metaDescription:
      "How Habib scholarships work — the role of your entrance test, transcript, and need assessment in merit and need-based financial aid.",
    h1: "Habib scholarship test — how grades and scores really work",
    intro:
      "There isn't a separate 'Habib scholarship test' — the same entrance exam feeds both admissions and scholarship decisions. What changes is the weight your transcript and financial documents carry alongside the score, and it's worth understanding that upfront.",
    sections: [
      {
        heading: "Merit-based support",
        paragraphs: [
          "Merit awards are tied to a combination of entrance test performance and academic transcript. A very strong score with an average transcript rarely qualifies alone — Habib is looking for consistency, not one great day. Applicants with strong track records across O and A levels or an equivalent qualification carry the strongest merit case.",
        ],
      },
      {
        heading: "Need-based support",
        paragraphs: [
          "Need-based aid is separate from merit and assessed through documentation of household income, dependents, and expenses. It's not a competitive process the way merit is — if you demonstrate need, Habib works to close the gap. Apply early and submit clean documents.",
        ],
      },
      {
        heading: "What your test score changes",
        paragraphs: [
          "The score is the entry ticket. Merit stacking, priority housing, and full-tuition consideration all use the score as a floor. Focus on clearing the DSSE or AHSS cutoffs first, then push higher — every band above the cutoff opens more of the financial-aid conversation.",
        ],
      },
    ],
    relatedLinks: [
      { label: "See scholarships and eligibility", href: "/grades" },
      { label: "Register and start practice", href: "/register" },
      { label: "See the test breakdown", href: "/test" },
    ],
  },
  {
    slug: "habib-essay-examples",
    keyword: "Habib essay examples",
    eyebrow: "Essay examples",
    eyebrowTone: "pink",
    metaTitle: "Habib essay examples — what the rubric rewards",
    metaDescription:
      "Habib essay examples and rubric analysis — thesis structure, argument, evidence, and the pitfalls that cost applicants marks.",
    h1: "Habib essay examples and what the rubric wants",
    intro:
      "Reading example essays is useful, but only if you read them against the rubric. Below is what the strongest Habib essays share, what the weakest ones repeat, and how the rubric actually decides your score.",
    sections: [
      {
        heading: "What strong essays share",
        bullets: [
          "A specific thesis in the first paragraph, not a vague framing.",
          "Body paragraphs that make one argument each, not three.",
          "Concrete evidence — an example, a story, a fact — not generalities.",
          "A counter-argument that's actually engaged, not name-checked.",
          "A conclusion that adds something, not one that summarises.",
        ],
      },
      {
        heading: "What weak essays repeat",
        paragraphs: [
          "The most common weak essay reads like a well-written encyclopedia entry — accurate, calm, and completely uncommitted. Habib is looking for a mind on the page. If the essay could have been written by anyone with a decent vocabulary, it will score in the middle band no matter how polished the sentences are.",
        ],
      },
      {
        heading: "How the rubric decides",
        paragraphs: [
          "Reading, Analysis, and Writing are graded separately. Reading is whether you actually engaged the prompt. Analysis is whether your argument is coherent. Writing is control — sentence variety, precision, transitions. A high overall score requires all three, not one hero score covering two weak ones.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Practise the essay", href: "/essay" },
      { label: "Persuasive essay structure", href: "/habib-persuasive-essay" },
      { label: "Essay writing practice", href: "/habib-essay-writing-practice" },
    ],
  },
];

export const SEO_LANDING_SLUGS = SEO_LANDING_PAGES.map((p) => p.slug);

export function getSeoLandingPage(slug: string): SeoLandingPage | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug);
}

export const SEO_CTA_LABEL = REGISTER_CTA;
