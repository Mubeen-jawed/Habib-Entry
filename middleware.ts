import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/practice", "/mock", "/attempts"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api/auth|favicon.ico|.*\\.).*)",
  ],
};
