import type { NextAuthConfig } from "next-auth";

/**
 * Edge/Node-safe NextAuth config — no providers, no DB imports.
 * Used by `proxy.ts` to check session validity (decode JWT cookie) without
 * pulling `mongoose`/`bcryptjs` into the proxy bundle. The full config with
 * the Credentials provider lives in `auth.ts` and is only used by the
 * `/api/auth/[...nextauth]` route handler and server-side code, which run
 * in the Node.js runtime.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
} satisfies NextAuthConfig;
