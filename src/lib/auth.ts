import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";
import { LOGIN_RATE_LIMIT_MAX_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_MS } from "@/lib/constants";
import { ApiRequestError } from "@/lib/api-utils";
import { authConfig } from "@/lib/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      company: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
    company?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

class RateLimitedError extends CredentialsSignin {
  code = "RateLimited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Rate limit login attempts per IP: 5 attempts / 15 minutes.
        const ip = getClientIp(request.headers);
        const limit = rateLimit(`login:${ip}`, LOGIN_RATE_LIMIT_MAX_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_MS);
        if (!limit.allowed) {
          throw new RateLimitedError();
        }

        await connectDB();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
        token.company = user.company as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.company = token.company as string;
      }
      return session;
    },
  },
});

/**
 * Reusable server-side session guard for API routes.
 * Throws a 401 ApiRequestError if there is no authenticated session.
 */
export async function getAuthenticatedSession() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiRequestError("Authentication required", 401);
  }
  return session;
}
