"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Menu,
  X,
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
  ActivitySquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/blog": "Blog Posts",
  "/admin/blog/new": "Novo Post",
  "/admin/showcase": "Showcase",
  "/admin/categories": "Categorias",
  "/admin/users": "Utilizadores",
};

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, exact: true },
  { href: "/admin/blog/pending", label: "Pendentes", icon: Clock },
  { href: "/admin/showcase", label: "Showcase", icon: Rocket },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/store", label: "Loja", icon: ShoppingBag },
  { href: "/admin/role-requests", label: "Pedidos de Role", icon: Shield },
  { href: "/admin/reports", label: "Denúncias", icon: Flag },
  { href: "/admin/audit-log", label: "Auditoria", icon: ActivitySquare },
  { href: "/admin/categories", label: "Categorias", icon: FolderOpen },
  { href: "/admin/users", label: "Utilizadores", icon: Users },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = breadcrumbMap[path];
    if (label) {
      crumbs.push({ label, href: path });
    }
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 w-full z-30 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-primary/10">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto md:pl-72">
        <div className="flex items-center gap-4">
          <h2 className="font-headline font-black text-2xl tracking-tighter text-primary">
            Painel Admin
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase">
            <span>System</span>
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-2">
                <ChevronRight size={12} />
                {i === crumbs.length - 1 ? (
                  <span className="text-white/60">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[10px] font-mono text-white/40 uppercase hover:text-primary transition-colors"
          >
            Ver Site
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-primary transition-colors"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-primary/10 bg-[#0e0e0e]/95 backdrop-blur-xl max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col px-6 py-4 gap-1">
            {adminLinks.map((link) => {
              const active = isActive(
                link.href,
                "exact" in link ? (link as { exact?: boolean }).exact : undefined,
              );
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase transition-colors",
                    active ? "text-primary bg-primary/5" : "text-white/40 hover:text-primary",
                  )}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
