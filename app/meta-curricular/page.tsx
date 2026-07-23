import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { MetaCurricularGuide } from "@/components/meta-curricular-guide";
import { RelatedPrepTopics, RELATED_SLUGS } from "@/components/related-prep-topics";
import { Sticker } from "@/components/ui/sticker";
import { ScribbleUnderline, Sparkle } from "@/components/ui/scribble";
import type { SchoolSlug } from "@/lib/schools";

export const metadata = {
  title: "Habib meta-curricular form guide — ranked activities for DSSE & AHSS | Imtehan",
  description:
    "How to fill Habib University's meta-curricular form: ranked activities, tier-based scoring, and universal do's and don'ts for DSSE and AHSS applicants, alongside broader Habib test preparation.",
  alternates: { canonical: "/meta-curricular" },
};

function Header() {
  return (
    <div className="relative mb-14">
      <Sticker rotate={-6} className="mb-5">
        <Sparkle className="w-3 h-3" /> free guide
      </Sticker>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.02]">
        The{" "}
        <span className="relative inline-block">
          meta-curricular
          <ScribbleUnderline color="currentColor" />
        </span>
        <br />
        cheat sheet.
      </h1>
      <p className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed max-w-xl">
        Habib&apos;s form asks about everything beyond grades. Here&apos;s what
        actually counts, ranked by tier, with the mistakes we&apos;ve seen
        applicants make.
      </p>
    </div>
  );
}

export default async function MetaCurricularPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  let userSchoolSlug: SchoolSlug | null = null;
  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { schoolSlug: true },
    });
    if (dbUser?.schoolSlug === "dsse" || dbUser?.schoolSlug === "ahss") {
      userSchoolSlug = dbUser.schoolSlug as SchoolSlug;
    }
  }

  if (signedIn) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <Header />
          <MetaCurricularGuide
            defaultSchool={userSchoolSlug ?? "dsse"}
            lockToSchool={Boolean(userSchoolSlug)}
            enableZoom={false}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <BackButton className="mb-6" />
          <Header />
          <MetaCurricularGuide defaultSchool="dsse" />
        </div>
        <RelatedPrepTopics
          slugs={[...RELATED_SLUGS.metaCurricular]}
          eyebrow="Also on Imtehan"
          eyebrowTone="peach"
          title="Habib entry test preparation, end to end"
          description="The meta-curricular form is one of five admission components. Here are guides to the rest."
        />
      </main>
      <SiteFooter />
    </>
  );
}
