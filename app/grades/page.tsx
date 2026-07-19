import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, GraduationCap } from "lucide-react";
import {
  INTERNATIONAL_BOARD,
  NATIONAL_BOARD,
  type Scholarship,
} from "./data";

export const metadata = { title: "Grades & scholarships, HabibEntry" };

export default function GradesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
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
      </div>
    </AppShell>
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
      <div className="px-5 pb-5 -mt-1 text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>{scholarship.details}</p>
        <div className="rounded-md border border-brand/20 bg-brand/5 px-3 py-2 text-foreground">
          <div className="text-xs font-medium uppercase tracking-wide text-brand mb-1">
            Grade requirement
          </div>
          {typeof scholarship.requirement === "string" ? (
            <p className="text-sm leading-relaxed">{scholarship.requirement}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 mt-1">
              <div className="rounded-md border border-brand/30 bg-background px-3 py-2 shadow-sm">
                <div className="text-sm font-bold text-brand mb-1">AKUEB</div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {scholarship.requirement.akueb}
                </p>
              </div>
              <div className="rounded-md border border-brand/30 bg-background px-3 py-2 shadow-sm">
                <div className="text-sm font-bold text-brand mb-1">
                  Other Boards
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {scholarship.requirement.otherBoards}
                </p>
              </div>
            </div>
          )}
        </div>
        {scholarship.ifNotMet && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-foreground">
            <div className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
              If requirement not met
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {scholarship.ifNotMet}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
