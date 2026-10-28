import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resolveOAuthUser } from "@/server/users";

/**
 * Google sign-in is only enabled when credentials are configured.
 *
 * NextAuth reads `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` from the
 * environment automatically. When they are missing the provider is omitted so
 * the app still boots and the credentials provider keeps working — instead of
 * every request failing with a configuration error.
 */
const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            profile: true
          }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.name || user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
    ...(googleEnabled ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only the OAuth providers need extra handling here.
      if (account?.provider !== "google") {
        return true;
      }

      const email = profile?.email ?? user.email;
      if (!email) {
        return false;
      }

      // Google always verifies emails, but check defensively: an unverified
      // email must not be able to create or claim an account.
      if (profile?.email_verified === false) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Google sign-in: map the external account onto our own user row and
      // store OUR user id in the token, so that every API route can look up
      // the user by `session.user.id`.
      if (account?.provider === "google" && account.providerAccountId) {
        const email = profile?.email ?? user.email;
        if (!email) {
          return token;
        }

        const dbUser = await resolveOAuthUser({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email,
          name: profile?.name ?? user.name,
          tokens: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });

        token.id = dbUser.id;
        token.isAdmin = dbUser.isAdmin;
        token.name = dbUser.profile?.name ?? email;
        return token;
      }

      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
