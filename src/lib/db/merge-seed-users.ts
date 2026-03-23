/**
 * Merge seed users into real Discord OAuth users.
 *
 * The seed script created users with fake Discord IDs (000000000000000001, 000000000000000002).
 * When the real users logged in via Discord OAuth, new records were created.
 * This script transfers all content (blog posts, comments, XP) from the seed
 * users to the real users, then deletes the seed records.
 *
 * Run: npx tsx --env-file=.env.local src/lib/db/merge-seed-users.ts
 */

import { eq, and, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, blogPosts, blogComments } from "@/lib/db/schema";

const SEED_DISCORD_IDS = ["000000000000000001", "000000000000000002"];

async function mergeSeedUsers() {
  // 1. Find all seed users
  const seedUsers = await db
    .select()
    .from(users)
    .where(
      sql`${users.discordId} IN (${sql.join(
        SEED_DISCORD_IDS.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );

  if (seedUsers.length === 0) {
    console.log("No seed users found. Nothing to merge.");
    return;
  }

  console.log(`Found ${seedUsers.length} seed user(s):`);
  for (const su of seedUsers) {
    console.log(
      `  - ${su.discordUsername} (id: ${su.id}, discordId: ${su.discordId}, xp: ${su.xpPoints})`,
    );
  }

  for (const seedUser of seedUsers) {
    // 2. Find the real user with the same discord username but different discord ID
    const [realUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.discordUsername, seedUser.discordUsername),
          ne(users.discordId, seedUser.discordId),
        ),
      )
      .limit(1);

    if (!realUser) {
      console.log(`⚠ No real user found for "${seedUser.discordUsername}" — skipping.`);
      continue;
    }

    console.log(
      `\nMerging "${seedUser.discordUsername}": seed(${seedUser.id}) → real(${realUser.id})`,
    );

    // 3. Transfer blog posts
    await db
      .update(blogPosts)
      .set({ authorId: realUser.id })
      .where(eq(blogPosts.authorId, seedUser.id));
    console.log(`  ✓ Transferred blog posts`);

    // 4. Transfer blog comments
    await db
      .update(blogComments)
      .set({ authorId: realUser.id })
      .where(eq(blogComments.authorId, seedUser.id));
    console.log(`  ✓ Transferred blog comments`);

    // 5. Add seed user's XP to real user
    const newXp = realUser.xpPoints + seedUser.xpPoints;
    const newLevel = Math.max(realUser.level, seedUser.level);
    await db
      .update(users)
      .set({
        xpPoints: newXp,
        level: newLevel,
        role:
          realUser.role === "member" && seedUser.role !== "member" ? seedUser.role : realUser.role,
        bio: realUser.bio || seedUser.bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, realUser.id));
    console.log(`  ✓ Updated XP: ${realUser.xpPoints} → ${newXp}, level: ${newLevel}`);

    // 6. Delete the seed user
    await db.delete(users).where(eq(users.id, seedUser.id));
    console.log(`  ✓ Deleted seed user (${seedUser.id})`);
  }

  console.log("\nDone! Seed users merged successfully.");
}

mergeSeedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error merging seed users:", err);
    process.exit(1);
  });
