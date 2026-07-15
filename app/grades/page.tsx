import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, GraduationCap } from "lucide-react";

export const metadata = { title: "Grades & scholarships — HabibEntry" };

type Scholarship = {
  name: string;
  headline: string;
  details: string;
};

const INTERNATIONAL_BOARD: Scholarship[] = [
  {
    name: "Habib YOHSIN Scholarship",
    headline: "100% of tuition & lab/studio fees",
    details:
      "Available for exceptionally well-rounded and highly meritorious students. At Habib University, being a distinguished YOHSIN scholar is the highest honor for incoming students.",
  },
  {
    name: "Habib Excellence Scholarship",
    headline: "60% to 80% of tuition & lab/studio fees",
    details:
      "Undergraduate scholarships that cover 60% to 80% of tuition and laboratory and/or studio fees of the recipients.",
  },
  {
    name: "Habib Merit Scholarship",
    headline: "Up to 50% of tuition & lab/studio fees",
    details:
      "Scholarships that cover up to 50% of tuition and laboratory and/or studio fees of the recipients.",
  },
];

const NATIONAL_BOARD: Scholarship[] = [
  {
    name: "Habib University Talent, Opportunity, Promotion and Support (HU TOPS)",
    headline: "100% financial support for four years",
    details:
      "Students awarded the HU TOPS scholarship receive 100% financial support for the duration of the four-year undergraduate program of their choice at Habib University.",
  },
  {
    name: "Habib University Equal Opportunity Program Scholarship (HU EOPS)",
    headline: "Up to 80% financial support",
    details:
      "Students awarded the HU EOP scholarship can receive up to 80% financial support toward their undergraduate program at Habib University.",
  },
];

export default function GradesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-8">
        <BackButton className="mb-6" />
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Admission component
          </div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 mt-1">
            <GraduationCap className="w-6 h-6 text-brand" />
            Grades & scholarships
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your academic transcript is one of the five admission components Habib evaluates.
            Strong grades open the door to merit- and need-based financial support.
          </p>
        </div>

        <ScholarshipGroup
          title="International Examination Board Applicants"
          description="For applicants sitting O/A Levels, IB, or equivalent international boards."
          scholarships={INTERNATIONAL_BOARD}
        />

        <ScholarshipGroup
          title="National Examination Board Applicants"
          description="For applicants sitting Matric, FSc, or equivalent national boards."
          scholarships={NATIONAL_BOARD}
        />
      </main>
      <SiteFooter />
    </>
  );
}

function ScholarshipGroup({
  title,
  description,
  scholarships,
}: {
  title: string;
  description: string;
  scholarships: Scholarship[];
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="mt-4 space-y-3">
        {scholarships.map((s) => (
          <ScholarshipItem key={s.name} scholarship={s} />
        ))}
      </div>
    </section>
  );
}

function ScholarshipItem({ scholarship }: { scholarship: Scholarship }) {
  return (
    <details className="group rounded-lg border bg-card open:border-brand/40 transition-colors">
      <summary className="flex items-start justify-between gap-4 p-5 cursor-pointer list-none">
        <div className="min-w-0">
          <div className="font-medium text-sm">{scholarship.name}</div>
          <Badge variant="secondary" className="mt-2">
            {scholarship.headline}
          </Badge>
        </div>
        <ChevronDown className="w-4 h-4 mt-1 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 -mt-1 text-sm text-muted-foreground leading-relaxed">
        {scholarship.details}
      </div>
    </details>
  );
}
