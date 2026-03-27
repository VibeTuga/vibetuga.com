import { db } from "@/lib/db";
import { badges } from "@/lib/db/schema";

const BADGES = [
  {
    name: "Contributor",
    slug: "contributor",
    description: "Membro reconhecido do programa de contribuidores",
    icon: "🤝",
    criteria: "Reconhecido como contribuidor pela equipa VibeTuga",
    xpReward: 100,
  },
  {
    name: "Monthly Star",
    slug: "monthly-star",
    description: "Destaque do mês na comunidade",
    icon: "🌟",
    criteria: "Top contribuidor do mês em XP",
    xpReward: 50,
  },
];

export async function seedBadges() {
  await db.insert(badges).values(BADGES).onConflictDoNothing();
}

// Run directly: npx tsx src/lib/db/seed-badges.ts
if (require.main === module) {
  seedBadges()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
