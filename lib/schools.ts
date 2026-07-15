export type SchoolSlug = "dsse" | "ahss";

export type TestComponent = {
  key: string;
  name: string;
  format: string;
  count: string;
  skills: string[];
};

export type School = {
  slug: SchoolSlug;
  code: string;
  name: string;
  tagline: string;
  color: string;
  accent: string;
  shared: TestComponent[];
  specific: TestComponent;
};

const SHARED_ENGLISH: TestComponent[] = [
  {
    key: "reading",
    name: "Accuplacer Reading",
    format: "Multiple choice",
    count: "~20–25 questions",
    skills: [
      "Information & Ideas — central ideas, summarizing, relationships",
      "Rhetoric — word choice, structure, point of view, arguments",
      "Synthesis across multiple texts",
      "Vocabulary in context",
    ],
  },
  {
    key: "writing",
    name: "Accuplacer Writing",
    format: "Multiple choice",
    count: "~20–25 questions",
    skills: [
      "Expression of Ideas — development, organization, effective language",
      "Standard English Conventions — sentence structure, usage, punctuation",
    ],
  },
  {
    key: "essay",
    name: "Essay Writing",
    format: "5-paragraph persuasive essay (~350–500 words)",
    count: "1 prompt",
    skills: [
      "Purpose & focus",
      "Critical thinking",
      "Organization & structure",
      "Development & support",
      "Sentence variety & style",
      "Mechanical conventions",
    ],
  },
];

export const SCHOOLS: Record<SchoolSlug, School> = {
  dsse: {
    slug: "dsse",
    code: "DSSE",
    name: "Dhanani School of Science & Engineering",
    tagline: "Advanced Level Math + shared English components.",
    color: "from-blue-500/15 to-transparent",
    accent: "text-blue-600",
    shared: SHARED_ENGLISH,
    specific: {
      key: "alm",
      name: "Advanced Level Mathematics (ALM)",
      format: "Multiple choice",
      count: "~20–25 questions",
      skills: [
        "Linear equations & applications",
        "Factoring, quadratics, polynomial equations",
        "Functions",
        "Radical & rational equations",
        "Exponential & logarithmic equations",
        "Geometry concepts",
        "Trigonometry",
      ],
    },
  },
  ahss: {
    slug: "ahss",
    code: "AHSS",
    name: "Arts, Humanities & Social Sciences",
    tagline: "Arithmetic + shared English components.",
    color: "from-amber-500/15 to-transparent",
    accent: "text-amber-700",
    shared: SHARED_ENGLISH,
    specific: {
      key: "arithmetic",
      name: "Arithmetic",
      format: "Multiple choice",
      count: "~20–25 questions",
      skills: [
        "Whole number operations",
        "Fraction operations & equivalents",
        "Decimal operations & equivalents",
        "Percent — including word problems",
        "Number comparison, equivalents, rounding, estimation",
        "Squares & square roots",
      ],
    },
  },
};

export const SCHOOL_LIST: School[] = [SCHOOLS.dsse, SCHOOLS.ahss];
