"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Video } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { SearchTrigger } from "@/components/shared/SearchDialog";
import { UserMenu, MobileUserMenu } from "@/components/layout/UserMenu";
import type { SessionUser } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { MessageBadge } from "@/components/shared/MessageBadge";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { cn } from "@/lib/utils";
import type { EnabledFeatures } from "@/lib/feature-gate";
import type { LiveStreamInfo } from "./HeaderServer";

const SearchDialog = dynamic(
  () => import("@/components/shared/SearchDialog").then((m) => m.SearchDialog),
  { ssr: false },
);

const allNavLinks = [
  { href: "/", labelKey: "home" },
  { href: "/blog", labelKey: "blog" },
  { href: "/showcase", labelKey: "showcase" },
  { href: "/challenges", labelKey: "challenges" },
  { href: "/events", labelKey: "events" },
  { href: "/streams", labelKey: "streams" },
  { href: "/leaderboard", labelKey: "leaderboard" },
  { href: "/contributors", labelKey: "contributors" },
  { href: "/store", labelKey: "store" },
  { href: "/pricing", labelKey: "premium" },
] as const;

interface HeaderProps {
  user?: SessionUser | null;
  features?: Partial<EnabledFeatures>;
  liveStream?: LiveStreamInfo;
}

export function Header({ user, features, liveStream }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");

  const navLinks = allNavLinks.filter((link) => {
    if (link.href === "/store" && features?.storeEnabled === false) return false;
    if (link.href === "/challenges" && features?.challengesEnabled === false) return false;
    return true;
  });

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors duration-200",
                isActive(link.href)
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-white/60 hover:text-white nav-link-hover",
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right side: lang + search + auth area + mobile toggle */}
        <div className="flex items-center gap-4">
          {liveStream && (
            <Link
              href="/streams"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded-full text-[11px] font-mono uppercase text-red-400 hover:bg-red-500/25 transition-colors"
              title={liveStream.title}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <Video size={12} />
              AO VIVO
            </Link>
          )}
          <LanguageToggle className="hidden sm:flex" />
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
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] active:scale-95 transition-all"
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "py-3 font-headline text-sm uppercase tracking-tight transition-colors",
                  isActive(link.href) ? "text-primary" : "text-white/60 hover:text-white",
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Mobile live indicator */}
            {liveStream && (
              <Link
                href="/streams"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-3 text-red-400 font-mono text-sm uppercase"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <Video size={14} />
                AO VIVO — {liveStream.title}
              </Link>
            )}

            {/* Mobile language toggle */}
            <div className="py-3 sm:hidden">
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
