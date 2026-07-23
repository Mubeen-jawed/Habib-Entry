import type { MetadataRoute } from "next";

const BASE_URL = "https://imtehan.pk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/attempts",
          "/attempts/",
          "/dashboard",
          "/mock/",
          "/practice/",
          "/testing",
          "/testing/",
          "/select-school",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
