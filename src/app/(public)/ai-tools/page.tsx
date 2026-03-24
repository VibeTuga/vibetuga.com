import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ferramentas AI para Programação | Melhores Editores e Assistentes IA | VibeTuga",
  description:
    "Descobre as melhores ferramentas de IA para programação: Cursor, Claude Code, GitHub Copilot, Windsurf, e mais. Guia completo com comparações, dicas, e recursos para vibe coding.",
  keywords: [
    "ferramentas AI programação",
    "ferramentas IA para programar",
    "cursor AI",
    "claude code",
    "github copilot",
    "windsurf IDE",
    "AI coding tools",
    "programação assistida por IA",
    "vibe coding ferramentas",
    "melhores editores IA",
    "AI pair programming",
    "agentes de código",
  ],
  openGraph: {
    title: "Ferramentas AI para Programação | VibeTuga",
    description:
      "Guia completo das melhores ferramentas de IA para programação. Cursor, Claude Code, GitHub Copilot e mais.",
    type: "website",
    url: "https://vibetuga.com/ai-tools",
    siteName: "VibeTuga",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferramentas AI para Programação | VibeTuga",
    description: "Guia completo das melhores ferramentas de IA para programação.",
  },
  alternates: {
    canonical: "https://vibetuga.com/ai-tools",
  },
};

interface Tool {
  name: string;
  category: "editor" | "assistant" | "agent" | "platform";
  description: string;
  features: string[];
  color: string;
  url: string;
}

const AI_TOOLS: Tool[] = [
  {
    name: "Cursor",
    category: "editor",
    description:
      "Fork do VS Code com IA nativa. Autocomplete, chat inline, e composição de código com Claude, GPT-4, e mais.",
    features: [
      "Tab autocomplete",
      "Chat inline",
      "Composer multi-ficheiro",
      "Integração com Claude",
    ],
    color: "text-primary",
    url: "https://cursor.com",
  },
  {
    name: "Claude Code",
    category: "agent",
    description:
      "Agente de terminal da Anthropic. Executa tarefas complexas de programação directamente no CLI com acesso ao filesystem.",
    features: ["Agente autónomo", "Acesso ao filesystem", "Git integrado", "Multi-step reasoning"],
    color: "text-secondary",
    url: "https://claude.ai",
  },
  {
    name: "GitHub Copilot",
    category: "assistant",
    description:
      "Assistente de código da GitHub/Microsoft. Integrado directamente no VS Code, JetBrains, e Neovim.",
    features: ["Inline suggestions", "Chat", "Multi-linguagem", "Integração IDE nativa"],
    color: "text-tertiary",
    url: "https://github.com/features/copilot",
  },
  {
    name: "Windsurf",
    category: "editor",
    description:
      "IDE com IA do Codeium. Flows system para tarefas multi-step, com contexto profundo do codebase.",
    features: ["Cascade flows", "Contexto profundo", "Autocomplete rápido", "Multi-modelo"],
    color: "text-primary",
    url: "https://windsurf.com",
  },
  {
    name: "Aider",
    category: "agent",
    description:
      "Pair programmer de terminal open-source. Edita ficheiros, cria commits, e suporta múltiplos modelos.",
    features: ["Open-source", "Git-aware", "Multi-modelo", "Edição de ficheiros"],
    color: "text-secondary",
    url: "https://aider.chat",
  },
  {
    name: "v0 by Vercel",
    category: "platform",
    description:
      "Gerador de UI com IA. Descreve o componente que queres e recebe código React/Tailwind pronto a usar.",
    features: ["Geração de UI", "React + Tailwind", "Iteração visual", "Deploy rápido"],
    color: "text-tertiary",
    url: "https://v0.dev",
  },
  {
    name: "Bolt",
    category: "platform",
    description:
      "Plataforma que gera apps full-stack a partir de prompts. Cria, edita e publica directamente no browser.",
    features: [
      "Full-stack no browser",
      "Deploy integrado",
      "Preview em tempo real",
      "Multi-framework",
    ],
    color: "text-primary",
    url: "https://bolt.new",
  },
  {
    name: "Replit Agent",
    category: "agent",
    description:
      "Agente de desenvolvimento integrado no Replit. Cria apps completas a partir de descrições em linguagem natural.",
    features: ["Ambiente cloud", "Deploy automático", "Base de dados integrada", "Agente autónomo"],
    color: "text-secondary",
    url: "https://replit.com",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  editor: "Editor / IDE",
  assistant: "Assistente",
  agent: "Agente Autónomo",
  platform: "Plataforma",
};

const CATEGORY_COLORS: Record<string, string> = {
  editor: "bg-primary/10 text-primary",
  assistant: "bg-tertiary/10 text-tertiary",
  agent: "bg-secondary/10 text-secondary",
  platform: "bg-white/10 text-white/70",
};

export default function AiToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-tertiary bg-tertiary/10 px-3 py-1.5">
              TOOLS_DATABASE::v1
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Ferramentas de <span className="text-tertiary">IA</span> para Programação
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 font-body leading-relaxed">
            Guia curado das melhores ferramentas de inteligência artificial para programação. De
            editores a agentes autónomos — tudo o que precisas para vibe coding.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-6 bg-surface-container">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter mb-4">
            Ferramentas Recomendadas
          </h2>
          <p className="text-white/40 text-sm mb-12 max-w-lg">
            Cada ferramenta tem os seus pontos fortes. Experimenta e descobre qual se adapta melhor
            ao teu workflow.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {AI_TOOLS.map((tool) => (
              <article
                key={tool.name}
                className="bg-surface-container-high p-8 rounded-sm group hover:bg-surface-container-highest transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`font-headline text-xl font-black ${tool.color}`}>{tool.name}</h3>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${CATEGORY_COLORS[tool.category]}`}
                  >
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                </div>
                <p className="text-white/50 text-sm font-body leading-relaxed mb-6">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2.5 py-1 bg-white/5 text-[10px] font-mono text-white/40 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-white/30 hover:text-primary uppercase tracking-widest transition-colors"
                >
                  Visitar site &rarr;
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How to choose */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter mb-12 text-center">
            Como escolher a ferramenta certa
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container p-8 rounded-sm">
              <h3 className="font-headline text-lg font-bold text-primary mb-4">
                Se queres um IDE completo
              </h3>
              <p className="text-white/50 text-sm font-body leading-relaxed mb-4">
                O <strong className="text-white">Cursor</strong> e o{" "}
                <strong className="text-white">Windsurf</strong> são as melhores opções. Funcionam
                como editores de código com IA nativa integrada — autocomplete, chat, e edição
                multi-ficheiro.
              </p>
              <p className="text-white/30 text-xs font-mono">
                Ideal para: desenvolvimento full-stack, projetos grandes
              </p>
            </div>
            <div className="bg-surface-container p-8 rounded-sm">
              <h3 className="font-headline text-lg font-bold text-secondary mb-4">
                Se queres um agente autónomo
              </h3>
              <p className="text-white/50 text-sm font-body leading-relaxed mb-4">
                O <strong className="text-white">Claude Code</strong> e o{" "}
                <strong className="text-white">Aider</strong> trabalham directamente no terminal.
                Dás instruções e o agente executa — edita ficheiros, cria commits, resolve bugs.
              </p>
              <p className="text-white/30 text-xs font-mono">
                Ideal para: tarefas complexas, refactoring, debugging
              </p>
            </div>
            <div className="bg-surface-container p-8 rounded-sm">
              <h3 className="font-headline text-lg font-bold text-tertiary mb-4">
                Se queres sugestões inline
              </h3>
              <p className="text-white/50 text-sm font-body leading-relaxed mb-4">
                O <strong className="text-white">GitHub Copilot</strong> é a opção mais madura para
                autocomplete inline. Funciona com VS Code, JetBrains, e Neovim sem mudar o teu
                workflow.
              </p>
              <p className="text-white/30 text-xs font-mono">
                Ideal para: produtividade diária, múltiplas linguagens
              </p>
            </div>
            <div className="bg-surface-container p-8 rounded-sm">
              <h3 className="font-headline text-lg font-bold text-white mb-4">
                Se queres prototipar rápido
              </h3>
              <p className="text-white/50 text-sm font-body leading-relaxed mb-4">
                O <strong className="text-white">v0</strong>,{" "}
                <strong className="text-white">Bolt</strong>, e o{" "}
                <strong className="text-white">Replit Agent</strong> geram apps completas a partir
                de prompts. Perfeito para MVPs e prototipagem rápida.
              </p>
              <p className="text-white/30 text-xs font-mono">
                Ideal para: MVPs, landing pages, ideias rápidas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog CTA */}
      <section className="py-16 px-6 bg-surface-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-2xl font-black text-white tracking-tighter mb-4">
            Aprende mais no nosso blog
          </h2>
          <p className="text-white/50 text-sm mb-8 max-w-lg mx-auto">
            A comunidade VibeTuga publica artigos sobre ferramentas IA, tutoriais de vibe coding, e
            comparações detalhadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-3 bg-tertiary/10 border border-tertiary/20 text-tertiary font-mono text-sm uppercase tracking-wider hover:bg-tertiary/20 transition-all"
            >
              Ver Artigos
            </Link>
            <Link
              href="/vibe-coding"
              className="inline-flex items-center justify-center px-8 py-3 border border-white/10 text-white font-mono text-sm uppercase tracking-wider hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              O que é Vibe Coding?
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter mb-6">
            Junta-te à comunidade
          </h2>
          <p className="text-white/50 text-base mb-10 max-w-lg mx-auto">
            Discute ferramentas, partilha dicas, e descobre como outros programadores portugueses
            usam IA no dia-a-dia.
          </p>
          <a
            href="https://discord.vibetuga.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
          >
            Entrar no Discord
          </a>
        </div>
      </section>
    </div>
  );
}
