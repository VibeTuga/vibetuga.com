"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { SearchTrigger } from "@/components/shared/SearchDialog";
import { UserMenu, MobileUserMenu } from "@/components/layout/UserMenu";
import type { SessionUser } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { MessageBadge } from "@/components/shared/MessageBadge";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Link } from "@/lib/navigation";
import { useTranslations, useLocale } from "@/lib/i18n-context";
import { LOCALES } from "@/lib/i18n-config";
import { cn } from "@/lib/utils";

const SearchDialog = dynamic(
  () => import("@/components/shared/SearchDialog").then((m) => m.SearchDialog),
  { ssr: false },
);

const NAV_KEYS = [
  { href: "/", key: "home" },
  { href: "/blog", key: "blog" },
  { href: "/showcase", key: "showcase" },
  { href: "/challenges", key: "challenges" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/store", key: "store" },
] as const;

export function Header({ user }: { user?: SessionUser | null }) {
  const rawPathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();

  // Strip locale prefix for active link detection
  const pathname = stripLocalePrefix(rawPathname, locale);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm uppercase">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors duration-200",
                isActive(link.href)
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-white/60 hover:text-white",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right side: language toggle + search + auth area + mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <SearchTrigger />
          <SearchDialog />

          {/* Auth: notifications + user menu or login button */}
          {user ? (
            <>
              <MessageBadge />
              <NotificationBell />
              <div className="hidden sm:block">
                <UserMenu user={user} />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
            >
              {t("login")}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-primary transition-colors"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-primary/10 bg-[#0e0e0e]/95 backdrop-blur-xl">
          <div className="flex flex-col px-6 py-4 gap-1">
            {NAV_KEYS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "py-3 font-headline text-sm uppercase tracking-tight transition-colors",
                  isActive(link.href) ? "text-primary" : "text-white/60 hover:text-white",
                )}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Mobile language toggle */}
            <div className="py-3">
              <LanguageToggle />
            </div>

            {/* Mobile auth section */}
            {user ? (
              <MobileUserMenu user={user} onNavigate={() => setMobileOpen(false)} />
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 py-3 text-center bg-primary text-on-primary font-bold text-sm"
              >
                {t("loginWithDiscord")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function stripLocalePrefix(pathname: string, _locale: string): string {
  for (const loc of LOCALES) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}
