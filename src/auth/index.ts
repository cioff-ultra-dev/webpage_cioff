import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getUserByEmail } from "@/db/queries";
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
        const parsedCredentials = requestAuthSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const [user] = await getUserByEmail(email);
          if (!user) return null;
          const passwordMatch = await isSamePassword(
            password || "",
            user?.password || ""
          );

          if (passwordMatch) return user;
        }

        return null;
      },
    }),
  ],
});
