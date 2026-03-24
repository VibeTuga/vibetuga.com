import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getHomepageStats, getHomepageFeaturedProjects } from "@/lib/db/queries/homepage";

export const metadata: Metadata = {
  title: "Vibe Coding Portugal | Comunidade de Programação com IA | VibeTuga",
  description:
    "A maior comunidade portuguesa de vibe coding — programa com IA, partilha projetos, aprende com a comunidade. Junta-te ao Discord e descobre o futuro da programação assistida por agentes.",
  keywords: [
    "vibe coding",
    "vibe coding Portugal",
    "vibe coding comunidade",
    "programação com IA",
    "programação assistida por IA",
    "comunidade programação Portugal",
    "AI coding Portugal",
    "vibe coder",
    "cursor AI",
    "claude code",
    "copilot",
    "agentes IA",
  ],
  openGraph: {
    title: "Vibe Coding Portugal | Comunidade de Programação com IA | VibeTuga",
    description:
      "A maior comunidade portuguesa de vibe coding. Programa com IA, partilha projetos, compete no leaderboard.",
    type: "website",
    url: "https://vibetuga.com/vibe-coding",
    siteName: "VibeTuga",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding Portugal | VibeTuga",
    description:
      "A maior comunidade portuguesa de vibe coding — programa com IA, partilha projetos, aprende com a comunidade.",
  },
  alternates: {
    canonical: "https://vibetuga.com/vibe-coding",
  },
};

export default async function VibeCodingPage() {
  const [stats, projects] = await Promise.all([getHomepageStats(), getHomepageFeaturedProjects(6)]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary bg-primary/10 px-3 py-1.5">
              VIBE_CODING::PT
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            O que é <span className="text-primary">Vibe Coding</span>?
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 font-body leading-relaxed">
            Vibe coding é uma forma de programar em que descreves o que queres em linguagem natural
            e a IA escreve o código por ti. Tu guias a direcção, a IA executa. Em vez de escreveres
            cada linha, ficas no fluxo criativo — na <em>vibe</em>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.vibetuga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Entrar no Discord
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-white/10 text-white font-mono text-sm uppercase tracking-wider hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* What is Vibe Coding */}
      <section className="py-20 px-6 bg-surface-container">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter mb-12 text-center">
            Como funciona o Vibe Coding
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Descreve a tua ideia",
                description:
                  "Explica em português o que queres construir. Pode ser uma app, um componente, uma API, ou qualquer coisa que imagines.",
                color: "text-primary",
              },
              {
                step: "02",
                title: "A IA escreve o código",
                description:
                  "Ferramentas como Claude, Cursor, e Copilot transformam as tuas instruções em código funcional. Tu decides a arquitectura, a IA implementa.",
                color: "text-secondary",
              },
              {
                step: "03",
                title: "Itera e envia",
                description:
                  "Revê o resultado, ajusta o que precisas, e publica. O ciclo é rápido — de ideia a produto em horas, não semanas.",
                color: "text-tertiary",
              },
            ].map((item) => (
              <div key={item.step} className="bg-surface-container-high p-8 rounded-sm">
                <span className={`font-mono text-3xl font-black ${item.color} mb-4 block`}>
                  {item.step}
                </span>
                <h3 className="font-headline text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm font-body leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter mb-4">
            A comunidade em números
          </h2>
          <p className="text-white/40 text-sm mb-12 max-w-lg mx-auto">
            Dezenas de programadores portugueses já estão a construir o futuro com vibe coding.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Membros", value: stats.totalMembers, color: "text-primary" },
              { label: "Projetos", value: stats.totalProjects, color: "text-secondary" },
              { label: "Artigos", value: stats.totalPosts, color: "text-tertiary" },
              { label: "XP Total", value: stats.totalXP, color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container p-6 rounded-sm">
                <span
                  className={`font-mono text-3xl md:text-4xl font-black ${stat.color} block mb-2`}
                >
                  {stat.value.toLocaleString("pt-PT")}
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="py-20 px-6 bg-surface-container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter">
                Projetos da Comunidade
              </h2>
              <Link
                href="/showcase"
                className="font-mono text-xs text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
              >
                Ver todos &rarr;
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/showcase/${project.slug}`}
                  className="group bg-surface-container-high rounded-sm overflow-hidden card-hover-glow"
                >
                  <div className="aspect-video relative bg-black">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline text-base font-bold text-white group-hover:text-primary transition-colors mb-2">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-white/40 text-xs line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-white/5 text-[10px] font-mono text-white/40 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why VibeTuga */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter mb-12 text-center">
            Porquê a VibeTuga?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Comunidade Portuguesa",
                description:
                  "Conteúdo em português, por programadores portugueses. Sem barreiras linguísticas para aprender vibe coding.",
                icon: "🇵🇹",
              },
              {
                title: "Showcase de Projetos",
                description:
                  "Mostra o que construíste com IA. Recebe feedback, ganha XP, e inspira outros a construir.",
                icon: "🚀",
              },
              {
                title: "Gamificação",
                description:
                  "Ganha XP por participar, sobe de nível, coleciona badges. Compete no leaderboard da comunidade.",
                icon: "🏆",
              },
              {
                title: "Blog & Tutoriais",
                description:
                  "Artigos sobre vibe coding, ferramentas IA, e boas práticas. Escritos por membros da comunidade.",
                icon: "📝",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-surface-container p-8 rounded-sm">
                <span className="text-2xl mb-4 block" role="img" aria-label={feature.title}>
                  {feature.icon}
                </span>
                <h3 className="font-headline text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm font-body leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-surface-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter mb-6">
            Pronto para entrar na <span className="text-primary">vibe</span>?
          </h2>
          <p className="text-white/50 text-base mb-10 max-w-lg mx-auto">
            Junta-te à comunidade portuguesa de vibe coding. Partilha projetos, aprende com outros,
            e constrói o futuro da programação com IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.vibetuga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
            >
              Junta-te ao Discord
            </a>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-3 border border-white/10 text-white font-mono text-sm uppercase tracking-wider hover:border-tertiary/30 hover:bg-tertiary/5 transition-all"
            >
              Ler o Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
