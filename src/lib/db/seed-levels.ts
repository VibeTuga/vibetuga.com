import { db } from "@/lib/db";
import { levels } from "@/lib/db/schema";

const LEVELS = [
  { level: 1, name: "Noob", xpRequired: 0, perks: null },
  { level: 2, name: "Script Kiddie", xpRequired: 100, perks: null },
  { level: 3, name: "Vibe Coder", xpRequired: 300, perks: null },
  { level: 4, name: "Prompt Whisperer", xpRequired: 600, perks: null },
  { level: 5, name: "AI Tamer", xpRequired: 1000, perks: null },
  { level: 6, name: "Code Wizard", xpRequired: 2000, perks: null },
  { level: 7, name: "Agent Builder", xpRequired: 4000, perks: null },
  { level: 8, name: "Tuga Master", xpRequired: 8000, perks: null },
  { level: 9, name: "Vibe Lord", xpRequired: 15000, perks: null },
  { level: 10, name: "Lenda", xpRequired: 30000, perks: null },
];

export async function seedLevels() {
  await db.insert(levels).values(LEVELS).onConflictDoNothing();
}

// Run directly: npx tsx src/lib/db/seed-levels.ts
if (require.main === module) {
  seedLevels()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
