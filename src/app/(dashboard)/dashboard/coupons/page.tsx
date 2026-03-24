import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CouponManager } from "./CouponManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cupões | VibeTuga",
};

export default async function CouponsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const canSell = ["admin", "moderator", "seller"].includes(session.user.role);
  if (!canSell) {
    redirect("/dashboard");
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Cupões de Desconto
        </h1>
        <p className="text-white/40 text-sm">Gere cupões de desconto para os teus produtos.</p>
      </header>

      <CouponManager />
    </div>
  );
}
