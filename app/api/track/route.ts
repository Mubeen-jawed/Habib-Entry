import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const runtime = "nodejs";

const SKIP_PATH_PREFIXES = ["/api/", "/_next/", "/admin"];

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("p") ?? "/";
  const visitorId = req.cookies.get("hb_vid")?.value;

  if (!visitorId) return NextResponse.json({ ok: true, skipped: "no-vid" });
  if (SKIP_PATH_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.json({ ok: true, skipped: "path" });
  }

  const session = await auth().catch(() => null);
  const userAgent = req.headers.get("user-agent") ?? undefined;
  const referer = req.headers.get("referer") ?? undefined;
  const country = req.headers.get("x-vercel-ip-country") ?? undefined;

  try {
    await db.pageView.create({
      data: {
        path: path.slice(0, 500),
        visitorId,
        userId: session?.user?.id,
        referer: referer?.slice(0, 500),
        userAgent: userAgent?.slice(0, 500),
        country,
      },
    });
  } catch {
    // swallow; tracking must never break requests
  }

  return NextResponse.json({ ok: true });
}
