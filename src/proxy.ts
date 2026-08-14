import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const PUBLIC_PATHS = ["/login"];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const isApiRoute = pathname.startsWith("/api");

  // API routes (other than auth/seed) enforce their own session checks via
  // getAuthenticatedSession() and return a proper JSON 401 — don't redirect them.
  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Skip Next internals and any request for a static file (has a file
  // extension, e.g. /brand/logo.png, /file.svg) so the image optimizer's
  // internal fetch for public/ assets never gets redirected to /login.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
