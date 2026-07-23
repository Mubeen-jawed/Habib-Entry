import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RelatedPrepTopics } from "@/components/related-prep-topics";
import type { Tone } from "@/lib/tones";

export function ComingSoon({
  title,
  tagline,
  bullets,
  relatedSlugs,
  relatedTitle,
  relatedEyebrow,
  relatedEyebrowTone,
}: {
  title: string;
  tagline: string;
  bullets: string[];
  relatedSlugs?: string[];
  relatedTitle?: React.ReactNode;
  relatedEyebrow?: React.ReactNode;
  relatedEyebrowTone?: Tone;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-8 pb-24">
          <BackButton className="mb-6" />
          <div className="text-center">
            <Badge variant="warning" className="mb-4">Coming soon</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            {tagline}
          </p>

          <ul className="mt-10 text-left rounded-lg border p-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/register">Create an account to be notified</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          </div>
        </section>
        {relatedSlugs && relatedSlugs.length > 0 && (
          <RelatedPrepTopics
            slugs={relatedSlugs}
            eyebrow={relatedEyebrow ?? "Related resources"}
            eyebrowTone={relatedEyebrowTone ?? "lavender"}
            title={relatedTitle ?? "Habib entrance test preparation, by topic"}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
