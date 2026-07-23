import type { SchoolSlug } from "./schools";

export type ActivityTier = "s" | "a" | "b" | "c" | "d";

export type ActivityRow = {
  activity: string;
  rating: number;
  tier: ActivityTier;
  why: string;
};

export type SchoolGuide = {
  slug: SchoolSlug;
  code: string;
  name: string;
  scope: string;
  activities: ActivityRow[];
  impresses: string[];
};

export const DSSE_GUIDE: SchoolGuide = {
  slug: "dsse",
  code: "DSSE",
  name: "Dhanani School of Science & Engineering",
  scope: "Computer Science, Computer Engineering, Electrical Engineering",
  activities: [
    { activity: "Built a real app, website, or software", rating: 10, tier: "s", why: "Demonstrates technical ability, initiative, and problem solving." },
    { activity: "Research project (AI, CS, Math, Science)", rating: 10, tier: "s", why: "Shows intellectual curiosity beyond school." },
    { activity: "National / International Olympiads or programming contests", rating: 9.8, tier: "s", why: "Strong evidence of academic excellence." },
    { activity: "Open-source contributions (GitHub)", rating: 9.8, tier: "s", why: "Indicates collaboration and real-world coding." },
    { activity: "Founded a startup or tech initiative", rating: 9.7, tier: "s", why: "Combines leadership with innovation." },
    { activity: "Robotics / Engineering projects", rating: 9.5, tier: "s", why: "Highly relevant to engineering." },
    { activity: "Internship in software / engineering", rating: 9.5, tier: "a", why: "Real-world experience." },
    { activity: "Freelancing (Web, App, UI/UX, AI)", rating: 9.2, tier: "a", why: "Shows practical skills and responsibility." },
    { activity: "Hackathons", rating: 9.0, tier: "a", why: "Teamwork and problem-solving under pressure." },
    { activity: "Teaching programming or STEM", rating: 9.0, tier: "a", why: "Leadership and communication." },
    { activity: "Science Fair", rating: 8.8, tier: "a", why: "Research and presentation skills." },
    { activity: "Coding Club leadership", rating: 8.7, tier: "a", why: "Leadership in a technical environment." },
    { activity: "Debate / MUN", rating: 7.5, tier: "b", why: "Valuable for communication but less directly relevant." },
    { activity: "Sports Captain", rating: 7.3, tier: "b", why: "Leadership and discipline." },
    { activity: "General sports participation", rating: 6.5, tier: "c", why: "Good, but not highly relevant." },
    { activity: "Online certificates only", rating: 5.5, tier: "c", why: "Best when supported by projects." },
    { activity: "Participation certificates only", rating: 3.0, tier: "d", why: "Limited evidence of achievement." },
  ],
  impresses: [
    "Technical projects",
    "GitHub contributions",
    "Apps & websites",
    "Research",
    "Programming contests",
    "Robotics",
    "STEM internships",
    "Open-source",
    "AI / ML projects",
    "Entrepreneurship",
  ],
};

export const AHSS_GUIDE: SchoolGuide = {
  slug: "ahss",
  code: "AHSS",
  name: "School of Arts, Humanities & Social Sciences",
  scope: "Humanities, Social Sciences, Communication & Design",
  activities: [
    { activity: "Published articles, essays, blogs", rating: 10, tier: "s", why: "Demonstrates writing and critical thinking." },
    { activity: "Independent research", rating: 10, tier: "s", why: "Shows intellectual depth." },
    { activity: "Debate (with achievements)", rating: 9.8, tier: "s", why: "Argumentation and communication skills." },
    { activity: "MUN leadership", rating: 9.7, tier: "s", why: "Leadership, diplomacy, analysis." },
    { activity: "Community service with measurable impact", rating: 9.7, tier: "s", why: "Reflects Habib's emphasis on civic engagement." },
    { activity: "Founded a social initiative / NGO / project", rating: 9.6, tier: "s", why: "Leadership and initiative." },
    { activity: "Theatre / Drama", rating: 9.2, tier: "a", why: "Creativity and confidence." },
    { activity: "Creative writing (poetry, stories)", rating: 9.2, tier: "a", why: "Strong portfolio material." },
    { activity: "Journalism / School magazine", rating: 9.1, tier: "a", why: "Writing and editorial experience." },
    { activity: "Photography / Film-making", rating: 9.0, tier: "a", why: "Creative expression." },
    { activity: "Graphic / UI Design portfolio", rating: 8.9, tier: "a", why: "Particularly valuable for Communication & Design." },
    { activity: "Teaching / Tutoring", rating: 8.8, tier: "a", why: "Service and communication." },
    { activity: "Internship (NGO, Media, Research)", rating: 8.8, tier: "a", why: "Relevant practical experience." },
    { activity: "Music / Art exhibitions", rating: 8.3, tier: "b", why: "Creative commitment." },
    { activity: "Sports Captain", rating: 8.0, tier: "b", why: "Leadership." },
    { activity: "General sports", rating: 7.0, tier: "c", why: "Positive but not usually central." },
    { activity: "Online certificates only", rating: 5.5, tier: "c", why: "Helpful only with practical work." },
    { activity: "Participation certificates only", rating: 3.0, tier: "d", why: "Weak evidence alone." },
  ],
  impresses: [
    "Writing portfolio",
    "Published articles",
    "Debate & MUN",
    "Community impact",
    "Research papers",
    "Theatre",
    "Journalism",
    "Creative portfolio",
    "Photography / Film",
    "Social initiatives",
  ],
};

export const GUIDES: Record<SchoolSlug, SchoolGuide> = {
  dsse: DSSE_GUIDE,
  ahss: AHSS_GUIDE,
};

export type UniversalRule = {
  do: string;
  dont: string;
  importance: number;
};

export const UNIVERSAL_RULES: UniversalRule[] = [
  { do: "Show measurable impact (\"Built a platform used by 300 students\")", dont: "Only write \"Participated\"", importance: 10 },
  { do: "Be honest and authentic", dont: "Exaggerate or fabricate accomplishments", importance: 10 },
  { do: "Upload strong supporting evidence", dont: "Submit activities without proof when proof exists", importance: 10 },
  { do: "Explain what you learned", dont: "Just list achievements", importance: 9.8 },
  { do: "Quantify results", dont: "Use vague descriptions", importance: 9.8 },
  { do: "Demonstrate leadership", dont: "Focus only on attendance", importance: 9.7 },
  { do: "Include personal passion projects", dont: "Think only school activities count", importance: 9.6 },
  { do: "Show long-term commitment", dont: "Include many one-day events", importance: 9.5 },
  { do: "Organize entries professionally", dont: "Mix unrelated achievements together without context", importance: 9.3 },
  { do: "Tailor activities to your intended school", dont: "Use the same generic descriptions for every program", importance: 9.2 },
];
