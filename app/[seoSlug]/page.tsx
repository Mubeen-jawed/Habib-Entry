import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPageView } from "@/components/seo-landing-page";
import {
  SEO_LANDING_PAGES,
  getSeoLandingPage,
} from "@/lib/seo-landing";

type Params = Promise<{ seoSlug: string }>;

export const dynamicParams = false;

export function generateStaticParams(): Array<{ seoSlug: string }> {
  return SEO_LANDING_PAGES.map((p) => ({ seoSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { seoSlug } = await params;
  const page = getSeoLandingPage(seoSlug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: "website",
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/${page.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function SeoLandingRoute({ params }: { params: Params }) {
  const { seoSlug } = await params;
  const page = getSeoLandingPage(seoSlug);
  if (!page) notFound();

  return <SeoLandingPageView page={page} />;
}
