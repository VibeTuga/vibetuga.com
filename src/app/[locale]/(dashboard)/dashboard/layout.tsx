import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/DashboardNav";

const PageFadeIn = dynamic(() =>
  import("@/components/shared/PageFadeIn").then((m) => m.PageFadeIn),
);

export const metadata = {
  title: "Dashboard | VibeTuga",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const canSell = ["admin", "moderator", "seller"].includes(session.user.role);

  return (
    <div className="min-h-screen">
      <DashboardNav canSell={canSell} />
      <main className="max-w-200 mx-auto px-6 py-8">
        <PageFadeIn>{children}</PageFadeIn>
      </main>
    </div>
  );
}
