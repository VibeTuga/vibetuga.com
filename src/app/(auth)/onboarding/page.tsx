import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = {
  title: "Onboarding | VibeTuga",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/onboarding");
  }

  // Check if user already completed onboarding (has displayName set)
  const [user] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user?.displayName) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
