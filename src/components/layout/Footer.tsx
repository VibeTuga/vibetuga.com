import { Logo } from "@/components/shared/Logo";

const socialLinks = [
  { href: "https://discord.vibetuga.com", label: "Discord" },
  { href: "https://twitch.tv/vibetugaai", label: "Twitch" },
  { href: "https://youtube.com/@VibeTuga", label: "YouTube" },
  { href: "https://tiktok.com/@vibetugaai", label: "TikTok" },
] as const;

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-white/5 py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" className="text-white" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/30">
            Feito com vibe em Portugal
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-8 font-mono text-[10px] tracking-widest uppercase">
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

        <div className="text-primary font-mono text-[10px] tracking-widest uppercase">
          &copy; {new Date().getFullYear()} VIBETUGA_SYSTEM
        </div>
      </div>
    </footer>
  );
}
