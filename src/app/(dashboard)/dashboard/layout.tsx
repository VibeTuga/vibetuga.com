import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { DashboardNav } from "@/components/layout/DashboardNav";

const PageFadeIn = dynamic(() =>
  import("@/components/shared/PageFadeIn").then((m) => m.PageFadeIn),
);

export const metadata = {
  title: "Dashboard | VibeTuga",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, storeEnabled, premiumEnabled] = await Promise.all([
    auth(),
    isFeatureEnabled("store_enabled"),
    isFeatureEnabled("premium_enabled"),
  ]);

  if (!session?.user) {
    redirect("/login");
  }

  const canSell = ["admin", "moderator", "seller"].includes(session.user.role);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <DashboardNav canSell={canSell} storeEnabled={storeEnabled} premiumEnabled={premiumEnabled} />
      <main className="flex-1 min-w-0 max-w-[1200px] mx-auto px-6 py-8 w-full">
        <PageFadeIn>{children}</PageFadeIn>
      </main>
    </div>
  );
}
