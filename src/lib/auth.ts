import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordId = profile.id as string;
        const discordUsername = (profile.username as string) ?? profile.name ?? "";
        const discordAvatar = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.png`
          : null;
        const email = profile.email ?? null;

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.discordId, discordId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(users)
            .set({
              discordUsername,
              discordAvatar,
              email,
              image: discordAvatar ?? user.image,
              name: discordUsername,
              updatedAt: new Date(),
            })
            .where(eq(users.discordId, discordId));

          // Ensure the NextAuth user.id matches our DB user id
          user.id = existing[0].id;
        } else {
          // New user — set fields that the adapter will use
          user.name = discordUsername;
          user.image = discordAvatar ?? user.image;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
      }

      // Fetch role from DB on sign-in or when token is refreshed
      if (trigger === "signIn" || !token.role) {
        const tokenId = token.id as string;
        const dbUser = await db
          .select({
            role: users.role,
            discordUsername: users.discordUsername,
          })
          .from(users)
          .where(eq(users.id, tokenId))
          .limit(1);

        if (dbUser.length > 0) {
          token.role = dbUser[0].role;
          token.discordUsername = dbUser[0].discordUsername;
        } else {
          token.role = "member";
          token.discordUsername = "";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.userId = token.id as string;
      session.user.role = token.role as typeof session.user.role;
      session.user.discordUsername = token.discordUsername as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
