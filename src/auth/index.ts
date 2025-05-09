import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getUserAuth, UserDataAuthType } from "@/db/queries";
import {
  accounts,
  authenticators,
  requestAuthSchema,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { isSamePassword } from "@/lib/password";
import { db } from "@/db";
import { authConfig } from "../../auth.config";
import { decryptPassword } from "@/lib/utils";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & UserDataAuthType;
  }
}

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & UserDataAuthType;
  }
}

export type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: Date;
};

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update: update,
} = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV !== "production",
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = await requestAuthSchema.safeParseAsync(
          credentials
        );

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await getUserAuth(email);

        if (!user) return null;

        const passwordDecrypted = decryptPassword(password || "");

        const passwordMatch = await isSamePassword(
          passwordDecrypted,
          user?.password || ""
        );

        if (passwordMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user = token.user as UserDataAuthType;
      return session;
    },
    jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        token.user = session.user;
        return token;
      }

      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});
