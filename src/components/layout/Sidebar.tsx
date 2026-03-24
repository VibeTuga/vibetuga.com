"use client";

import { Link } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { Home, FileText, LayoutGrid, Trophy, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/showcase", label: "Showcase", icon: LayoutGrid },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-primary/10 bg-background z-40 pt-24">
      <div className="px-6 mb-8">
        <Logo size="sm" />
        <div className="font-mono text-[10px] text-primary tracking-widest uppercase opacity-60 mt-1">
          SYSTEM_ACTIVE
        </div>
      </div>

      <nav className="flex-1">
        {sidebarLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-6 py-3 font-mono text-xs uppercase transition-all duration-200",
                active
                  ? "text-primary bg-primary/5 border-r-2 border-primary"
                  : "text-white/40 hover:bg-surface-container hover:text-primary",
              )}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
