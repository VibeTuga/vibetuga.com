import { auth } from "@/lib/auth";
import { getEnabledFeatures } from "@/lib/feature-gate";
import { getLiveStream } from "@/lib/db/queries/streams";
import { Header } from "./Header";
import type { SessionUser } from "./UserMenu";

export type LiveStreamInfo = {
  id: string;
  platform: "twitch" | "youtube";
  title: string;
} | null;

export async function HeaderServer() {
  const [session, features, liveStream] = await Promise.all([
    auth(),
    getEnabledFeatures(),
    getLiveStream(),
  ]);

  const user: SessionUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
        discordUsername: session.user.discordUsername,
      }
    : null;

  return <Header user={user} features={features} liveStream={liveStream} />;
}
