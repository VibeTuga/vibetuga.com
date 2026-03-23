"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/blog": "Blog Posts",
  "/admin/blog/new": "Novo Post",
  "/admin/categories": "Categorias",
  "/admin/users": "Utilizadores",
};

export function AdminHeader() {
  const pathname = usePathname();

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
        </div>
      </div>
    </header>
  );
}
