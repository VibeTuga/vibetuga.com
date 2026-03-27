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
  {
    name: "First Post",
    slug: "first-post",
    description: "Publicou o primeiro post no blog",
    icon: "✍️",
    criteria: "Publicar pelo menos 1 post",
    xpReward: 25,
  },
  {
    name: "First Project",
    slug: "first-project",
    description: "Submeteu o primeiro projeto no showcase",
    icon: "🚀",
    criteria: "Submeter pelo menos 1 projeto",
    xpReward: 25,
  },
  {
    name: "7-Day Streak",
    slug: "streak-7",
    description: "Manteve uma streak de 7 dias consecutivos",
    icon: "🔥",
    criteria: "Streak de 7 dias",
    xpReward: 50,
  },
  {
    name: "30-Day Streak",
    slug: "streak-30",
    description: "Manteve uma streak de 30 dias consecutivos",
    icon: "💎",
    criteria: "Streak de 30 dias",
    xpReward: 200,
  },
  {
    name: "Community Helper",
    slug: "helpful",
    description: "Ajudou a comunidade com 10+ comentários",
    icon: "💬",
    criteria: "10 ou mais comentários",
    xpReward: 50,
  },
  {
    name: "AI Tamer",
    slug: "level-5",
    description: "Atingiu o nível 5",
    icon: "⚡",
    criteria: "Atingir nível 5",
    xpReward: 100,
  },
  {
    name: "Lenda",
    slug: "level-10",
    description: "Atingiu o nível máximo",
    icon: "👑",
    criteria: "Atingir nível 10",
    xpReward: 500,
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
