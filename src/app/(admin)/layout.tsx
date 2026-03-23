import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

const PageFadeIn = dynamic(() =>
  import("@/components/shared/PageFadeIn").then((m) => m.PageFadeIn),
);

export const metadata = {
  title: "Admin | VibeTuga",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles = ["admin", "moderator"] as const;
  if (!allowedRoles.includes(session.user.role as (typeof allowedRoles)[number])) {
    redirect("/");
  }

  return (
    <>
      <AdminSidebar />
      <AdminHeader />
      <main className="pt-24 pb-20 md:pb-12 px-6 max-w-[1440px] mx-auto md:pl-72 min-h-screen">
        <PageFadeIn>{children}</PageFadeIn>
      </main>
    </>
  );
}
