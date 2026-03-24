"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  Layers,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  User,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/profile", label: "Meu Perfil", icon: User },
  { href: "/dashboard/submit-post", label: "Submeter Post", icon: FileText },
  { href: "/dashboard/submit-project", label: "Submeter Projeto", icon: Layers },
  { href: "/dashboard/my-series", label: "Séries", icon: BookOpen },
  { href: "/dashboard/my-purchases", label: "Minhas Compras", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Lista de Desejos", icon: Heart },
  { href: "/dashboard/messages", label: "Mensagens", icon: MessageCircle },
  { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
  { href: "/dashboard/settings", label: "Definições", icon: Settings },
];

const sellerLinks = [
  { href: "/dashboard/my-products", label: "Meus Produtos", icon: Package },
  { href: "/dashboard/submit-product", label: "Submeter Produto", icon: Plus },
  { href: "/dashboard/seller-analytics", label: "Análise de Vendas", icon: BarChart3 },
  { href: "/dashboard/coupons", label: "Cupões", icon: Tag },
  { href: "/dashboard/seller-payouts", label: "Pagamentos", icon: Wallet },
];

export function DashboardNav({ canSell }: { canSell: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allLinks = canSell ? [...dashboardLinks, ...sellerLinks] : dashboardLinks;

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="border-b border-white/5 bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-6">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Dashboard
        </span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {allLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors",
                  isActive(
                    link.href,
                    "exact" in link ? (link as { exact?: boolean }).exact : undefined,
                  )
                    ? "text-primary"
                    : "text-white/50 hover:text-primary",
                )}
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-white/30 uppercase tracking-widest hover:text-white transition-colors"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-primary transition-colors"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/5">
          <div className="flex flex-col px-6 py-2 gap-1">
            {allLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase transition-colors",
                    isActive(
                      link.href,
                      "exact" in link ? (link as { exact?: boolean }).exact : undefined,
                    )
                      ? "text-primary bg-primary/5"
                      : "text-white/50 hover:text-primary",
                  )}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
