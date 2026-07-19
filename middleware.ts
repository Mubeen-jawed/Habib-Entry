import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Section practice, mock tests, essay writer, attempt review, and interview
// booking are open to any signed-in user. Bulk testing tools stay admin-only.
const ADMIN_ONLY_PREFIXES = [
  "/testing",
];

const USER_PROTECTED_PREFIXES = ["/practice", "/attempts", "/mock", "/essay", "/interview"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  ...USER_PROTECTED_PREFIXES,
  ...ADMIN_ONLY_PREFIXES,
  "/admin",
];

// Signed-in users should land on the dashboard, not the marketing home or the
// auth screens.
const REDIRECT_IF_AUTHED = new Set(["/", "/login", "/register"]);

// Paths we don't want to log as "page views".
const TRACK_SKIP_PREFIXES = ["/api/", "/_next/", "/favicon"];

function newVisitorId() {
  // crypto.randomUUID is available in the edge runtime.
  return crypto.randomUUID();
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !isAdminLogin;

  const sessionUser = (
    req.auth as unknown as {
      user?: { role?: string; schoolSlug?: string | null };
    } | null
  )?.user;
  const role = sessionUser?.role;
  const schoolSlug = sessionUser?.schoolSlug;

  if (req.auth && REDIRECT_IF_AUTHED.has(pathname) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtected && !req.auth) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only gate for /admin/* (except the login page itself).
  if (isAdminPath && !isAdminLogin) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Admin-only gate for all test-taking routes.
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminOnly && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard?locked=1", req.url));
  }

  // Signed-in non-admin users without a school picked yet must complete that
  // step before using any protected area of the app.
  if (
    req.auth &&
    isProtected &&
    role !== "ADMIN" &&
    schoolSlug !== "dsse" &&
    schoolSlug !== "ahss"
  ) {
    const url = new URL("/select-school", req.url);
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();

  // Ensure every visitor has a stable id cookie for visitor tracking.
  const skip = TRACK_SKIP_PREFIXES.some((p) => pathname.startsWith(p));
  let visitorId = req.cookies.get("hb_vid")?.value;
  if (!visitorId) {
    visitorId = newVisitorId();
    res.cookies.set("hb_vid", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (!skip) {
    // Fire a background beacon to record the pageview without blocking navigation.
    // We use a dedicated /api/track endpoint so we can hit the Node runtime
    // (Prisma isn't supported on the edge middleware runtime).
    const trackUrl = new URL("/api/track", req.url);
    trackUrl.searchParams.set("p", pathname + (search || ""));
    // fire-and-forget; ignore any failure so navigation is never blocked.
    fetch(trackUrl.toString(), {
      method: "POST",
      headers: {
        cookie: `hb_vid=${visitorId}`,
        "user-agent": req.headers.get("user-agent") ?? "",
        referer: req.headers.get("referer") ?? "",
      },
      // Don't wait for the response.
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  }

  return res;
});

export const config = {
  matcher: [
    "/((?!_next|api/auth|api/track|favicon.ico|.*\\.).*)",
  ],
};
