import { db } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";

const FLAGS = [
  {
    key: "store_enabled",
    isEnabled: true,
    rolloutPercentage: 100,
    description: "Ativa/desativa a loja de produtos digitais",
  },
  {
    key: "challenges_enabled",
    isEnabled: true,
    rolloutPercentage: 100,
    description: "Ativa/desativa os desafios da comunidade",
  },
];

async function seedFeatureFlags() {
  for (const flag of FLAGS) {
    await db.insert(featureFlags).values(flag).onConflictDoNothing({ target: featureFlags.key });
  }
}

seedFeatureFlags()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to seed feature flags:", err);
    process.exit(1);
  });
