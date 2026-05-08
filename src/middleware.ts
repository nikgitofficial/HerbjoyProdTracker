import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// ─── Route Definitions ────────────────────────────────────────────────────────

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
] as const;

const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/forgot-password",
  "/api/verify-otp",
  "/api/reset-password",
] as const;

const DASHBOARD_ROOT = "/dashboard";
const LOGIN_PATH = "/login";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Prevents bfcache on authenticated pages.
 * Without this, hitting the browser back button after logout
 * restores the frozen page snapshot without re-validating the session.
 */
function withNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  return response;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;

  // 1. Always allow public API routes through
  if (isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from public pages (e.g. /login)
  if (isLoggedIn && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL(DASHBOARD_ROOT, nextUrl));
  }

  // 3. Redirect unauthenticated users to login, preserving the intended URL
  if (!isLoggedIn && !isPublicPath(pathname)) {
    const loginUrl = new URL(LOGIN_PATH, nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated request — allow through with no-cache headers
  //    to prevent stale bfcache snapshots after logout
  return withNoCacheHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - Files with extensions (e.g. .png, .svg, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};