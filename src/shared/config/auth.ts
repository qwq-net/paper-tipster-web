import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [Discord],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        // Add custom fields to session
        session.user.role = user.role;
        session.user.id = user.id;
      }
      return session;
    },
  },
});
