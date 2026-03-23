"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Clock,
  Rocket,
  Mail,
  ShoppingBag,
  Shield,
  Flag,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const adminLinks: readonly {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badgeKey?: string;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, exact: true },
  { href: "/admin/blog/pending", label: "Pendentes", icon: Clock },
  { href: "/admin/showcase", label: "Showcase", icon: Rocket },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/store", label: "Loja", icon: ShoppingBag },
  { href: "/admin/reports", label: "Denúncias", icon: Flag, badgeKey: "reports" },
  { href: "/admin/role-requests", label: "Pedidos de Role", icon: Shield },
  { href: "/admin/categories", label: "Categorias", icon: FolderOpen },
  { href: "/admin/users", label: "Utilizadores", icon: Users },
];

export function AdminSidebar({ pendingReportsCount = 0 }: { pendingReportsCount?: number }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-primary/10 bg-background z-40">
      <div className="p-6 border-b border-white/5">
        <Logo size="sm" />
        <p className="font-mono text-[10px] text-primary/60 tracking-widest mt-1 uppercase">
          SYSTEM_ACTIVE
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {adminLinks.map((link) => {
          const active = isActive(link.href, link.exact);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase transition-all duration-200",
                active
                  ? "text-primary bg-primary/5 border-r-2 border-primary"
                  : "text-white/40 hover:bg-surface-container hover:text-primary",
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{link.label}</span>
              {link.badgeKey === "reports" && pendingReportsCount > 0 && (
                <span className="bg-error text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingReportsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary/20 bg-surface-container-high flex items-center justify-center">
            <span className="text-primary text-xs font-bold">A</span>
          </div>
          <div>
            <p className="text-[10px] font-headline font-bold uppercase text-white">
              Administrator
            </p>
            <p className="text-[8px] font-mono text-primary uppercase">Painel Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
