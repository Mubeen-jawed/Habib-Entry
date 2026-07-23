import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScribbleUnderline } from "@/components/ui/scribble";
import { cn } from "@/lib/utils";
import { toneBg, toneText } from "@/lib/tones";
import { SEO_CTA_LABEL, type SeoLandingPage } from "@/lib/seo-landing";

export function SeoLandingPageView({ page }: { page: SeoLandingPage }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="md" className="pt-8 md:pt-10">
          <BackButton />
        </Container>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
          <Container size="md" className="relative pt-10 md:pt-16 pb-14 md:pb-20">
            <div
              className={cn(
                "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
                toneText[page.eyebrowTone]
              )}
            >
              <span className="w-6 h-px bg-current" />
              {page.eyebrow}
              <span className="w-6 h-px bg-current" />
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance">
              {page.h1}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/70 leading-relaxed max-w-3xl">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="brand">
                <Link href="/register">
                  {SEO_CTA_LABEL} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/test">See the test breakdown</Link>
              </Button>
            </div>
          </Container>
        </section>

        {/* Content sections */}
        <Container size="md" className="pb-16 md:pb-24">
          <div className="space-y-10 md:space-y-14">
            {page.sections.map((s) => (
              <article key={s.heading}>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-4 text-foreground/80 leading-relaxed">
                  {s.paragraphs?.map((p, i) => (
                    <p key={i} className="text-base md:text-lg">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="mt-2 space-y-2 text-base md:text-lg">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex gap-3">
                          <span
                            className={cn(
                              "mt-2 h-1.5 w-1.5 rounded-full shrink-0",
                              toneBg[page.eyebrowTone]
                            )}
                            aria-hidden
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Related links */}
          {page.relatedLinks.length > 0 && (
            <div className="mt-16 pt-10 border-t">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Keep exploring
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {page.relatedLinks.map((l) => (
                  <Link
                    key={l.href + l.label}
                    href={l.href}
                    className="group flex items-center justify-between rounded-2xl border bg-card px-4 py-4 shadow-soft transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">{l.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>

        {/* CTA banner */}
        <Container size="md" className="pb-16 md:pb-24">
          <div className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 md:p-12 shadow-soft bg-mesh-soft bg-card">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-pink blur-3xl opacity-70" aria-hidden />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-mint blur-3xl opacity-70" aria-hidden />
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-6 justify-between">
              <div className="max-w-xl">
                <h3 className="text-2xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
                  Ready when{" "}
                  <span className="relative inline-block">
                    you are.
                    <ScribbleUnderline color="#B4457A" />
                  </span>
                </h3>
                <p className="text-foreground/70 mt-3 text-base md:text-lg">
                  Create an account and start with a free practice section — no card required.
                </p>
              </div>
              <Button asChild size="xl" variant="brand" className="w-full md:w-auto shrink-0">
                <Link href="/register">
                  {SEO_CTA_LABEL} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
