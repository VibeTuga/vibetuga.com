import Link from "next/link";

const stats = [
  { value: "1,248", label: "Total Members", color: "text-primary" },
  { value: "412", label: "Projects Shipped", color: "text-tertiary" },
  { value: "89", label: "Blog Posts", color: "text-secondary" },
  { value: "2,581", label: "XP Total", color: "text-white" },
] as const;

const featuredProjects = [
  {
    title: "VibeOS Dashboard",
    author: "alex_dev",
    tags: ["Next.js", "Claude"],
    type: "WEB_APP",
    votes: 128,
  },
  {
    title: "Agent_PT-01",
    author: "miguel_codes",
    tags: ["Python", "OpenAI"],
    type: "AGENT_TOOL",
    votes: 85,
  },
  {
    title: "Cursor-Snippets-PT",
    author: "sara_vibe",
    tags: ["TypeScript", "Cursor"],
    type: "EXTENSION",
    votes: 342,
  },
  {
    title: "Supabase-Flow",
    author: "tuga_hacker",
    tags: ["PostgreSQL", "Supabase"],
    type: "DATABASE",
    votes: 210,
  },
] as const;

const latestPosts = [
  {
    category: "AI Tooling",
    categoryColor: "text-secondary",
    hoverColor: "hover:border-secondary",
    title: "Como usar o Claude 3.5 para refatorar código legado em minutos",
    author: "pedro_vibes",
    readTime: "5 min read",
    views: "1.2k views",
  },
  {
    category: "Community",
    categoryColor: "text-tertiary",
    hoverColor: "hover:border-tertiary",
    title: "Vibe Coding: O novo paradigma de desenvolvimento",
    author: "rui_codes",
    readTime: "8 min read",
    views: "850 views",
  },
  {
    category: "React Tips",
    categoryColor: "text-secondary",
    hoverColor: "hover:border-secondary",
    title: "O guia definitivo de animações sem CSS com Framer Motion",
    author: "ana_ux",
    readTime: "12 min read",
    views: "2.1k views",
  },
] as const;

const leaderboardData = [
  { rank: "#1", username: "vibe_master", level: "Vibe Coder", xp: "12,450", highlight: true },
  { rank: "#2", username: "cyber_tuga", level: "Sentinel", xp: "9,200", highlight: false },
  { rank: "#3", username: "lisbon_glow", level: "Rebel", xp: "7,800", highlight: false },
  { rank: "#4", username: "retro_coder", level: "Builder", xp: "6,420", highlight: false },
  { rank: "#5", username: "neon_panda", level: "Hacker", xp: "5,100", highlight: false },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label text-[10px] tracking-widest text-primary uppercase">
              System Online: v2.0.4
            </span>
          </div>

          <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            Onde o código <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
              encontra a vibe
            </span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 font-light">
            A comunidade portuguesa de vibe coding, AI tooling e desenvolvimento
            assistido por agentes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
            >
              Junta-te ao Discord
            </Link>
            <Link
              href="/showcase"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-tertiary/40 text-tertiary font-bold hover:bg-tertiary/5 hover:border-tertiary transition-all"
            >
              Explora Projetos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-outline-variant/10 bg-surface-container-low py-8">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className={`text-3xl font-mono font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-[1440px] mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">
              Projetos em Destaque
            </h2>
            <p className="text-on-surface-variant text-sm">
              O que a comunidade está a construir.
            </p>
          </div>
          <Link
            href="/showcase"
            className="text-primary text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((project) => (
            <div
              key={project.title}
              className="group bg-surface-container border border-white/5 p-4 transition-all hover:bg-surface-container-high hover:border-primary/30"
            >
              {/* Image placeholder */}
              <div className="relative aspect-video mb-4 overflow-hidden bg-surface-container-lowest">
                <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container-low" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-tertiary">
                  {project.type}
                </div>
              </div>

              <h3 className="font-headline font-bold text-lg mb-2 truncate">
                {project.title}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-surface-container-highest" />
                <span className="text-xs text-on-surface-variant">
                  {project.author}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 border border-white/10 text-white/40 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1 text-primary">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span className="text-xs font-mono font-bold">
                    {project.votes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts & Leaderboard Grid */}
      <section className="max-w-[1440px] mx-auto px-6 py-24 border-t border-outline-variant/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Latest Posts (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
                Últimos Posts
              </h2>
              <Link href="/blog" className="text-white/40 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="space-y-6">
              {latestPosts.map((post) => (
                <div
                  key={post.title}
                  className={`group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 hover:bg-surface-container-low transition-colors border-l-2 border-transparent ${post.hoverColor}`}
                >
                  <div className="aspect-video bg-surface-container-highest overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container" />
                  </div>
                  <div>
                    <span
                      className={`font-label text-[10px] ${post.categoryColor} font-bold uppercase tracking-widest mb-2 block`}
                    >
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        {post.readTime}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        {post.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Widget (1/3 width) */}
          <div>
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight mb-8">
              Leaderboard
            </h2>
            <div className="bg-surface-container border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-normal">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-normal">
                      User
                    </th>
                    <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest text-right font-normal">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono">
                  {leaderboardData.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`border-b border-white/5 ${
                        entry.highlight ? "bg-primary/5" : ""
                      }`}
                    >
                      <td
                        className={`px-4 py-4 font-bold ${
                          entry.highlight
                            ? "text-primary"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {entry.rank}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30" />
                          <div className="flex flex-col">
                            <span className="text-white font-bold">
                              {entry.username}
                            </span>
                            <span className="text-[9px] text-primary/60 uppercase">
                              {entry.level}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-4 text-right ${
                          entry.highlight ? "text-primary" : "text-white/60"
                        }`}
                      >
                        {entry.xp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-center">
                <Link
                  href="/leaderboard"
                  className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Ver ranking completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
