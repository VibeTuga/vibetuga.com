import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userBadges, badges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WidgetEmbedCodes } from "./widget-embed-codes";

export const metadata: Metadata = {
  title: "Widgets | VibeTuga",
};

export default async function WidgetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch user's earned badges for badge widget section
  const earnedBadges = await db
    .select({
      slug: badges.slug,
      name: badges.name,
      icon: badges.icon,
    })
    .from(userBadges)
    .innerJoin(badges, eq(badges.id, userBadges.badgeId))
    .where(eq(userBadges.userId, userId));

  // Get user display name for preview
  const [user] = await db
    .select({ displayName: users.displayName, discordUsername: users.discordUsername })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const displayName = user?.displayName || user?.discordUsername || "User";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Widgets Embed&aacute;veis</h1>
        <p className="text-sm text-white/50 mt-1">
          Adiciona o teu perfil VibeTuga ao teu site pessoal, README do GitHub, ou qualquer outro
          lugar.
        </p>
      </div>

      <WidgetEmbedCodes userId={userId} displayName={displayName} earnedBadges={earnedBadges} />
    </div>
  );
}
