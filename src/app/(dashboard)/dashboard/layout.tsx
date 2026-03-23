import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { FileText, Home, Layers, Package, Plus, ShoppingBag, User } from "lucide-react";

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
      {/* Dashboard nav bar */}
      <div className="border-b border-white/5 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-6">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Dashboard
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <User size={14} />
              Meu Perfil
            </Link>
            <Link
              href="/dashboard/submit-post"
              className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <FileText size={14} />
              Submeter Post
            </Link>
            <Link
              href="/dashboard/submit-project"
              className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <Layers size={14} />
              Submeter Projeto
            </Link>
            <Link
              href="/dashboard/my-purchases"
              className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <ShoppingBag size={14} />
              Minhas Compras
            </Link>
            {canSell && (
              <>
                <Link
                  href="/dashboard/my-products"
                  className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  <Package size={14} />
                  Meus Produtos
                </Link>
                <Link
                  href="/dashboard/submit-product"
                  className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  <Plus size={14} />
                  Submeter Produto
                </Link>
              </>
            )}
          </nav>
          <Link
            href="/"
            className="ml-auto flex items-center gap-2 text-xs font-mono text-white/30 uppercase tracking-widest hover:text-white transition-colors"
          >
            <Home size={14} />
            Voltar
          </Link>
        </div>
      </div>
      <main className="max-w-[800px] mx-auto px-6 py-8">
        <PageFadeIn>{children}</PageFadeIn>
      </main>
    </div>
  );
}
