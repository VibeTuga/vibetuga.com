"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  Code,
  FileText,
  Heart,
  Home,
  Key,
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  sellerOnly?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Início", icon: Home, exact: true },
      { href: "/dashboard/profile", label: "Meu Perfil", icon: User },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/dashboard/submit-post", label: "Submeter Post", icon: FileText },
      { href: "/dashboard/submit-project", label: "Submeter Projeto", icon: Layers },
      { href: "/dashboard/my-series", label: "Séries", icon: BookOpen },
    ],
  },
  {
    label: "Compras",
    items: [
      { href: "/dashboard/my-purchases", label: "Minhas Compras", icon: ShoppingBag },
      { href: "/dashboard/wishlist", label: "Lista de Desejos", icon: Heart },
    ],
  },
  {
    label: "Social",
    items: [
      { href: "/dashboard/messages", label: "Mensagens", icon: MessageCircle },
      { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/dashboard/widgets", label: "Widgets", icon: Code },
      { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
      { href: "/dashboard/settings", label: "Definições", icon: Settings },
    ],
  },
  {
    label: "Vendedor",
    sellerOnly: true,
    items: [
      { href: "/dashboard/my-products", label: "Meus Produtos", icon: Package },
      { href: "/dashboard/submit-product", label: "Submeter Produto", icon: Plus },
      { href: "/dashboard/seller-analytics", label: "Análise de Vendas", icon: BarChart3 },
      { href: "/dashboard/coupons", label: "Cupões", icon: Tag },
      { href: "/dashboard/seller-payouts", label: "Pagamentos", icon: Wallet },
    ],
  },
];

interface DashboardNavProps {
  canSell: boolean;
  storeEnabled?: boolean;
}

export function DashboardNav({ canSell, storeEnabled = true }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleGroups = navGroups.filter((g) => {
    if (g.sellerOnly && (!canSell || !storeEnabled)) return false;
    return true;
  });

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden border-b border-white/5 bg-surface-container-low">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Dashboard
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white/60 hover:text-primary transition-colors p-1"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-surface-container-low border-r border-white/5 overflow-y-auto transition-transform duration-200",
          "lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:h-screen lg:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Dashboard
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="px-3 py-4 space-y-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-mono text-white/25 uppercase tracking-widest">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors",
                          active
                            ? "text-primary bg-primary/8"
                            : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]",
                        )}
                      >
                        <Icon size={15} className={active ? "text-primary" : "text-white/30"} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Back to site */}
        <div className="px-3 pb-6 mt-auto">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-white/30 hover:text-white/60 transition-colors"
          >
            <Home size={15} />
            Voltar ao site
          </Link>
        </div>
      </aside>
    </>
  );
}
