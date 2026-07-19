import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth, unstable_update } from "@/auth";
import { db } from "@/lib/db";
import { Sticker } from "@/components/ui/sticker";
import { Sparkle } from "@/components/ui/scribble";
import { SCHOOL_LIST, type SchoolSlug } from "@/lib/schools";
import { toneBg, toneText, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

const SCHOOL_TONES: Record<SchoolSlug, Tone> = {
  dsse: "sky",
  ahss: "peach",
};

export default async function SelectSchoolPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const rawCallback = params?.callbackUrl ?? "/dashboard";
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/dashboard";
  const error = params?.error;

  const isAdmin = session.user.role === "ADMIN";
  // Non-admins who already picked a school shouldn't see this onboarding step
  // again. Admins can always open it (from the navbar link) as a preview.
  if (
    !isAdmin &&
    (session.user.schoolSlug === "dsse" || session.user.schoolSlug === "ahss")
  ) {
    redirect(callbackUrl);
  }

  const firstName = session.user.name?.split(" ")[0];

  async function selectSchoolAction(slug: SchoolSlug) {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/login");

    if (slug !== "dsse" && slug !== "ahss") {
      redirect(
        `/select-school?error=required&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    }

    await db.user.update({
      where: { id: s.user.id },
      data: { schoolSlug: slug },
    });

    // Force the JWT to refresh so the middleware sees the new schoolSlug on
    // the very next request; otherwise the user would loop back here.
    await unstable_update({ user: { schoolSlug: slug } });

    redirect(callbackUrl);
  }

  return (
    <div className="min-h-screen bg-mesh-soft">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <div className="text-center space-y-4 mb-10 md:mb-14">
          
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Welcome{firstName ? `, ${firstName}` : ""}. Pick your school.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            We&apos;ll tailor your practice, mocks, and dashboard to the school
            you&apos;re applying to. You can change this later from your
            dashboard.
          </p>
          {error === "required" && (
            <div className="mx-auto max-w-md rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Please choose one of the schools below.
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {SCHOOL_LIST.map((school) => {
            const tone = SCHOOL_TONES[school.slug];
            return (
              <form
                key={school.slug}
                action={selectSchoolAction.bind(null, school.slug)}
              >
                <button
                  type="submit"
                  className="group relative w-full text-left flex flex-col gap-5 rounded-3xl border bg-card p-8 md:p-10 shadow-soft overflow-hidden transition-all hover:shadow-pop hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <div
                    className={cn(
                      "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-80 transition-opacity group-hover:opacity-100",
                      toneBg[tone],
                    )}
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                        toneBg[tone],
                        toneText[tone],
                      )}
                    >
                      {school.code}
                    </span>
                    <Sticker tone={tone} rotate={-6}>
                      <Sparkle color="currentColor" className="w-3 h-3" />
                      {school.slug === "dsse"
                        ? "CE | EE | CS"
                        : "CnD | CH | SDP"}
                    </Sticker>
                  </div>

                  <div className="relative space-y-2">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                      {school.name}
                    </h2>
                    <p className="text-muted-foreground">{school.tagline}</p>
                  </div>

                  

                  <div
                    className={cn(
                      "relative mt-2 inline-flex items-center text-sm font-semibold",
                      toneText[tone],
                    )}
                  >
                    Continue as {school.code}
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </form>
            );
          })}
        </div>

        
      </div>
    </div>
  );
}
