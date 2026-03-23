import type { Metadata } from "next";
import { NewsletterForm } from "./NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter | VibeTuga",
  description:
    "Recebe os melhores artigos, projetos da comunidade e dicas de vibe coding diretamente no teu email.",
  openGraph: {
    title: "Newsletter | VibeTuga",
    description:
      "Recebe os melhores artigos, projetos da comunidade e dicas de vibe coding diretamente no teu email.",
  },
  alternates: {
    canonical: "https://vibetuga.com/newsletter",
  },
};

export default function NewsletterPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      {/* Status indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-label text-[10px] tracking-widest text-primary uppercase">
          Newsletter_Protocol
        </span>
      </div>

      <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
        Fica no{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
          Loop
        </span>
      </h1>

      <p className="text-on-surface-variant text-lg max-w-lg mx-auto mb-4 font-light">
        Recebe os melhores artigos, novos projetos da comunidade, e dicas de vibe coding diretamente
        no teu email.
      </p>

      <div className="text-on-surface-variant/60 text-sm mb-12 space-y-2">
        <p className="flex items-center justify-center gap-2">
          <span className="text-primary font-mono">&gt;</span> Artigos e tutoriais exclusivos
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-tertiary font-mono">&gt;</span> Projetos em destaque da semana
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-secondary font-mono">&gt;</span> Ferramentas AI e novidades do
          ecossistema
        </p>
      </div>

      <NewsletterForm source="newsletter_page" />
    </div>
  );
}
