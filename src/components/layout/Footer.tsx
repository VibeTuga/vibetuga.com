"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/shared/Logo";

const socialLinks = [
  { href: "https://discord.vibetuga.com", label: "Discord" },
  { href: "https://twitch.tv/vibetugaai", label: "Twitch" },
  { href: "https://youtube.com/@VibeTuga", label: "YouTube" },
  { href: "https://tiktok.com/@vibetugaai", label: "TikTok" },
] as const;

function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const t = useTranslations("footer");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message ?? t("subscribed"));
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? t("subscribeError"));
      }
    } catch {
      setStatus("error");
      setMessage(t("connectionError"));
    }
  }

  if (status === "success") {
    return (
      <p className="font-mono text-primary text-[10px] uppercase tracking-widest">✓ {message}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1">
        {t("newsletter")}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-xs select-none">
            $
          </span>
          <input
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-label={t("emailLabel")}
            required
            disabled={status === "loading"}
            className="w-full bg-surface-container-lowest border border-white/10 focus:border-primary/30 text-xs py-2 pl-6 pr-3 text-white placeholder:text-white/20 font-mono outline-none transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? t("subscribing") : t("subscribe")}
        </button>
      </div>
      {status === "error" && (
        <p className="text-error font-mono text-[9px] uppercase tracking-widest">{message}</p>
      )}
    </form>
  );
}

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-surface-container-lowest border-t border-white/5 py-12 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="flex flex-col items-start gap-2">
            <Logo size="sm" className="text-white" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-white/30">
              {t("madeIn")}
            </span>
          </div>

          <FooterNewsletterForm />

          <div className="flex flex-wrap gap-6 font-mono text-[10px] tracking-widest uppercase">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-secondary transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-primary font-mono text-[10px] tracking-widest uppercase">
            &copy; {new Date().getFullYear()} VIBETUGA_SYSTEM
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-[10px] tracking-widest uppercase">
            <Link
              href="/vibe-coding"
              className="text-white/30 hover:text-tertiary transition-colors duration-300"
            >
              {t("vibeCoding")}
            </Link>
            <Link
              href="/ai-tools"
              className="text-white/30 hover:text-tertiary transition-colors duration-300"
            >
              {t("aiTools")}
            </Link>
            <Link
              href="/privacy"
              className="text-white/30 hover:text-tertiary transition-colors duration-300"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-white/30 hover:text-tertiary transition-colors duration-300"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
