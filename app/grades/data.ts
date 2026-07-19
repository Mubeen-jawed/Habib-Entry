export type Requirement = string | { akueb: string; otherBoards: string };

export type Scholarship = {
  name: string;
  headline: string;
  details: string;
  requirement: Requirement;
  ifNotMet?: string;
};

export const INTERNATIONAL_BOARD: Scholarship[] = [
  {
    name: "Habib YOHSIN Scholarship",
    headline: "100% of tuition & lab/studio fees",
    details:
      "Available for exceptionally well-rounded and highly meritorious students. At Habib University, being a distinguished YOHSIN scholar is the highest honor for incoming students.",
    requirement:
      "A Levels: no grade below A in any subject. IBD: minimum 30 points.",
    ifNotMet:
      "In case a YOHSIN Scholar does not meet this requirement, the 100% Scholarship will be reduced to 80% scholarship provided the student meets the minimum requirement of obtaining an average C grade that is 65% for A Level students and 30 points for IBD students, also that no grade less than D to be there.",
  },
  {
    name: "Habib Excellence Scholarship",
    headline: "60% to 80% of tuition & lab/studio fees",
    details:
      "Undergraduate scholarships that cover 60% to 80% of tuition and laboratory and/or studio fees of the recipients.",
    requirement:
      "A Levels: average C (65%) across three subjects, no grade below D. IBD: minimum 30 points.",
    ifNotMet:
      "In case of students not meeting this requirement, the scholarship awarded will be withdrawn, however, students will have an opportunity to apply for Financial Aid.",
  },
  {
    name: "Habib Merit Scholarship",
    headline: "Up to 50% of tuition & lab/studio fees",
    details:
      "Scholarships that cover up to 50% of tuition and laboratory and/or studio fees of the recipients.",
    requirement:
      "A Levels: average C (65%) across three subjects, no grade below D. IBD: minimum 30 points.",
    ifNotMet:
      "In case of students not meeting this requirement, the scholarship awarded will be withdrawn, however, students will have an opportunity to apply for Financial Aid.",
  },
];

export const NATIONAL_BOARD: Scholarship[] = [
  {
    name: "Habib University Talent, Opportunity, Promotion and Support (HU TOPS)",
    headline: "100% financial support for four years",
    details:
      "Students awarded the HU TOPS scholarship receive 100% financial support for the duration of the four-year undergraduate program of their choice at Habib University.",
    requirement: {
      otherBoards:
        "Science Group: at least 80% in intermediate and at least 85% in matric. Other Group: at least 75% in intermediate and at least 80% in matric.",
      akueb:
        "Science Group: at least 80% in intermediate and at least 85% in matric. Other Group: at least 75% in intermediate and at least 80% in matric.",
    },
  },
  {
    name: "Habib University Equal Opportunity Program Scholarship (HU EOPS)",
    headline: "Up to 80% financial support",
    details:
      "Students awarded the HU EOP scholarship can receive up to 80% financial support toward their undergraduate program at Habib University.",
    requirement: {
      otherBoards:
        "Science Group: at least 70% in intermediate and at least 75% in matric. Other Group: at least 70% in intermediate and at least 70% in matric.",
      akueb:
        "Science Group: at least 70% in intermediate and at least 70% in matric. Other Group: at least 70% in intermediate and at least 70% in matric.",
    },
  },
];
