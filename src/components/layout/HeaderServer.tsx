import { auth } from "@/lib/auth";
import { getEnabledFeatures } from "@/lib/feature-gate";
import { Header } from "./Header";
import type { SessionUser } from "./UserMenu";

export async function HeaderServer() {
  const [session, features] = await Promise.all([auth(), getEnabledFeatures()]);

  const user: SessionUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
        discordUsername: session.user.discordUsername,
      }
    : null;

  return <Header user={user} features={features} />;
}
