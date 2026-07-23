import type { MetadataRoute } from "next";
import { SCHOOL_LIST } from "@/lib/schools";
import { SEO_LANDING_SLUGS } from "@/lib/seo-landing";

const BASE_URL = "https://imtehan.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${BASE_URL}/`,                changeFrequency: "weekly",  priority: 1.0 },
      { url: `${BASE_URL}/test`,            changeFrequency: "monthly", priority: 0.8 },
      { url: `${BASE_URL}/grades`,          changeFrequency: "monthly", priority: 0.7 },
      { url: `${BASE_URL}/essay`,           changeFrequency: "monthly", priority: 0.7 },
      { url: `${BASE_URL}/interview`,       changeFrequency: "monthly", priority: 0.7 },
      { url: `${BASE_URL}/meta-curricular`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${BASE_URL}/eca`,             changeFrequency: "monthly", priority: 0.7 },
      { url: `${BASE_URL}/resources`,       changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE_URL}/register`,        changeFrequency: "yearly",  priority: 0.5 },
      { url: `${BASE_URL}/login`,           changeFrequency: "yearly",  priority: 0.3 },
    ] as const
  ).map((r) => ({ ...r, lastModified: now }));

  const schoolRoutes: MetadataRoute.Sitemap = SCHOOL_LIST.map((s) => ({
    url: `${BASE_URL}/schools/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const seoLandingRoutes: MetadataRoute.Sitemap = SEO_LANDING_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...schoolRoutes, ...seoLandingRoutes];
}
