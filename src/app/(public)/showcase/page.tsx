const filterTabs = [
  { label: "All", active: true },
  { label: "SaaS", active: false },
  { label: "Tools", active: false },
  { label: "Games", active: false },
  { label: "Art", active: false },
  { label: "AI Agents", active: false },
] as const;

const featuredProject = {
  title: "Terminal OS: Genesis",
  author: "@cyber_tuga",
  description:
    "Uma interface de comando ultra-rápida construída para automação de workflows dev em Portugal. Integração nativa com APIs locais.",
  tags: ["NEXT.JS", "RUST", "TAILWIND"],
} as const;

const projects = [
  {
    title: "VibeStream SDK",
    author: "@nuno_dev",
    level: 24,
    description:
      "Protocolo de streaming descentralizado otimizado para latência ultra-baixa em nodes europeus.",
    tags: ["#TS", "#WEBRTC"],
    aiTool: "Claude 3.5",
    votes: 452,
    featured: true,
  },
  {
    title: "AutoAutomate",
    author: "@ze_tuga",
    level: 12,
    description:
      "Engine de automação baseada em voz para gerir instâncias AWS sem tocar no teclado.",
    tags: ["#PYTHON", "#AWS"],
    aiTool: "Cursor",
    votes: 218,
    featured: false,
  },
  {
    title: "VibeShader Gen",
    author: "@pixel_ninja",
    level: 8,
    description: "Gerador de shaders GLSL procedurais via prompts de linguagem natural.",
    tags: ["#GLSL", "#AI"],
    aiTool: "GPT-4o",
    votes: 184,
    featured: false,
  },
  {
    title: "TugaBot Discord",
    author: "@joao_ai",
    level: 0,
    description:
      "O assistente definitivo para comunidades Discord tugas, focado em moderação e gamificação.",
    tags: ["#NODEJS", "#REDIS"],
    aiTool: "Claude",
    votes: 97,
    featured: false,
  },
] as const;

export default function ShowcasePage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-white uppercase mb-2">
          Showcase
        </h1>
        <p className="font-label text-primary tracking-widest text-sm opacity-80">
          PROJETOS CONSTRUÍDOS PELA COMUNIDADE VIBETUGA.
        </p>
      </div>

      {/* Featured Project Banner */}
      <section className="mb-16">
        <div className="relative group overflow-hidden rounded-sm bg-surface-container border border-secondary/20 shadow-[0_0_30px_rgba(216,115,255,0.1)] hover:shadow-[0_0_40px_rgba(216,115,255,0.2)] transition-all duration-500">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/3 h-[400px] overflow-hidden relative bg-surface-container-lowest">
              <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-low" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-transparent to-transparent hidden lg:block" />
              <div className="absolute top-4 left-4">
                <span className="bg-secondary text-on-secondary px-3 py-1 font-label text-[10px] font-bold tracking-widest uppercase">
                  Projeto em Destaque
                </span>
              </div>
            </div>
            <div className="lg:w-1/3 p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-secondary/40" />
                <div>
                  <p className="text-xs font-label text-secondary tracking-widest uppercase">
                    Criado por
                  </p>
                  <p className="text-sm font-bold text-white">{featuredProject.author}</p>
                </div>
              </div>
              <h2 className="font-headline text-3xl font-black text-white mb-4 leading-tight uppercase">
                {featuredProject.title}
              </h2>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                {featuredProject.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {featuredProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-surface-container-highest border border-outline-variant text-[10px] text-white/70 font-label"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full py-4 bg-secondary text-on-secondary font-headline font-black uppercase tracking-tighter hover:bg-secondary-dim transition-all flex items-center justify-center gap-2 group/btn">
                Ver Projeto
                <svg
                  className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mb-12 sticky top-[80px] z-40 bg-background/90 backdrop-blur-md py-4">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.label}
                className={`px-4 py-2 font-label text-[10px] font-black uppercase whitespace-nowrap transition-colors ${
                  tab.active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="BUSCAR_PROJECTO..."
                className="w-full bg-surface-container-lowest border border-white/10 pl-10 pr-4 py-2 text-xs font-label text-white focus:border-tertiary focus:ring-0 transition-all outline-none"
              />
            </div>
            <select className="bg-surface-container-lowest border border-white/10 text-xs font-label text-white/60 px-4 py-2 focus:border-tertiary outline-none">
              <option>TRENDING</option>
              <option>NEWEST</option>
              <option>UPVOTED</option>
            </select>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.title}
            className="group bg-surface-container-low border border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col hover:scale-[1.02]"
          >
            {/* Image placeholder */}
            <div className="relative h-48 overflow-hidden bg-surface-container-lowest">
              <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container opacity-60 group-hover:opacity-90 transition-opacity" />
              {project.featured && (
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-sm border border-primary/30">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-[9px] font-label font-bold text-primary tracking-tighter uppercase">
                      Featured
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex flex-col items-center bg-black/80 px-2 py-1 rounded-sm border border-white/10">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <span className="font-label text-[10px] font-bold text-white">{project.votes}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30" />
                  {project.level > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {project.level}
                    </div>
                  )}
                </div>
                <span className="text-xs font-label text-white/50 tracking-tight">
                  {project.author}
                </span>
              </div>

              <h3 className="font-headline text-lg font-bold text-white mb-2 uppercase group-hover:text-primary transition-colors">
                {project.title}
              </h3>

              <p className="text-on-surface-variant text-xs mb-4 leading-relaxed line-clamp-2">
                {project.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-label text-white/40 uppercase">
                    {tag}
                  </span>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <svg
                    className="w-3 h-3 text-tertiary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[9px] font-label text-tertiary uppercase">
                    {project.aiTool}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty placeholder card */}
        <div className="bg-surface-container-low border border-white/5 border-dashed flex items-center justify-center h-[400px]">
          <div className="text-center p-8">
            <svg
              className="w-12 h-12 text-white/10 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="font-headline text-white/20 uppercase font-black">Teu Projeto Aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
