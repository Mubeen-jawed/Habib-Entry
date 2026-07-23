import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { RelatedPrepTopics } from "@/components/related-prep-topics";
import type { Tone } from "@/lib/tones";

export function SignedOutPreview({
  title,
  description,
  callbackUrl,
  relatedSlugs,
  relatedTitle,
  relatedEyebrow,
  relatedEyebrowTone,
}: {
  title: string;
  description: string;
  callbackUrl: string;
  relatedSlugs?: string[];
  relatedTitle?: React.ReactNode;
  relatedEyebrow?: React.ReactNode;
  relatedEyebrowTone?: Tone;
}) {
  const signInHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <BackButton />
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="max-w-xl text-center">
          <div className="text-xs uppercase tracking-wider text-brand-strong font-medium">
            Let&apos;s ace the Habib test
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="brand" size="lg" asChild>
              <Link href={registerHref}>Get started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={signInHref}>Sign in</Link>
            </Button>
          </div>
          </div>
        </div>
        {relatedSlugs && relatedSlugs.length > 0 && (
          <RelatedPrepTopics
            slugs={relatedSlugs}
            eyebrow={relatedEyebrow ?? "Related resources"}
            eyebrowTone={relatedEyebrowTone ?? "lavender"}
            title={relatedTitle ?? "Explore Habib entrance test prep by topic"}
            spacing="md"
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
