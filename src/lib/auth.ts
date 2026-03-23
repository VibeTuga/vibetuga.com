import NextAuth from "next-auth";
import Discord, { type DiscordProfile } from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens, referrals } from "./db/schema";
import { awardXP } from "./gamification";
import { createNotification } from "./notifications";

function getDiscordAvatarUrl(profile: DiscordProfile) {
  if (!profile.avatar) {
    return null;
  }

  const format = profile.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
}

function getDiscordImageUrl(profile: DiscordProfile) {
  const customAvatar = getDiscordAvatarUrl(profile);

  if (customAvatar) {
    return customAvatar;
  }

  const defaultAvatarNumber =
    profile.discriminator === "0"
      ? Number(BigInt(profile.id) >> BigInt(22)) % 6
      : Number.parseInt(profile.discriminator, 10) % 5;

  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
}

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
      profile(profile) {
        const discordAvatar = getDiscordAvatarUrl(profile);
        const image = getDiscordImageUrl(profile);

        return {
          id: profile.id,
          email: profile.email,
          image,
          name: profile.global_name ?? profile.username,
          discordId: profile.id,
          discordUsername: profile.username,
          discordAvatar,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordId = profile.id as string;
        const discordUsername = (profile.username as string) ?? profile.name ?? "";
        const discordAvatar = getDiscordAvatarUrl(profile as DiscordProfile);
        const discordImage = getDiscordImageUrl(profile as DiscordProfile);
        const email = profile.email ?? null;

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.discordId, discordId))
          .limit(1);

        const isNewUser = existing.length === 0;

        if (existing.length > 0) {
          await db
            .update(users)
            .set({
              discordUsername,
              discordAvatar,
              email,
              image: discordImage ?? user.image,
              name: discordUsername,
              updatedAt: new Date(),
            })
            .where(eq(users.discordId, discordId));

          // Ensure the NextAuth user.id matches our DB user id
          user.id = existing[0].id;
        } else {
          // New user — set fields that the adapter will use
          user.name = discordUsername;
          user.image = discordImage ?? user.image;
        }

        // Process referral for new users
        if (isNewUser) {
          try {
            const cookieStore = await cookies();
            const refCode = cookieStore.get("vibetuga_ref")?.value;
            if (refCode) {
              // Delete the cookie
              cookieStore.delete("vibetuga_ref");

              const [referral] = await db
                .select()
                .from(referrals)
                .where(eq(referrals.referralCode, refCode))
                .limit(1);

              if (referral && referral.status === "pending") {
                // We need the new user's ID. For new users, the adapter
                // hasn't created them yet at this point. We'll handle it in
                // the jwt callback when trigger === "signIn" and there's a ref code.
                // Store the ref code in the user object temporarily.
                (user as Record<string, unknown>).referralCode = refCode;
              }
            }
          } catch {
            // Cookie read may fail in some contexts — silently ignore
          }
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

      // Process referral for new users (the user object exists on first sign-in)
      if (trigger === "signIn" && user) {
        const refCode = (user as Record<string, unknown>).referralCode as string | undefined;
        if (refCode && token.id) {
          try {
            const [referral] = await db
              .select()
              .from(referrals)
              .where(eq(referrals.referralCode, refCode))
              .limit(1);

            if (
              referral &&
              referral.status === "pending" &&
              referral.referrerId !== (token.id as string)
            ) {
              await db
                .update(referrals)
                .set({
                  referredUserId: token.id as string,
                  status: "completed",
                  xpAwarded: 25,
                  completedAt: new Date(),
                })
                .where(eq(referrals.id, referral.id));

              await awardXP(referral.referrerId, "referred_user", referral.id);

              createNotification({
                userId: referral.referrerId,
                type: "referral_completed",
                title: "Referência completada!",
                body: "Alguém que convidaste juntou-se à VibeTuga. +25 XP!",
                link: "/dashboard/referrals",
                actorId: token.id as string,
              }).catch(() => null);
            }
          } catch {
            // Referral processing failure should not block login
          }
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
