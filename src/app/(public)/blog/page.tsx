import Link from "next/link";

const categories = [
  { label: "Tudo", active: true, color: "bg-primary text-on-primary" },
  { label: "Tutoriais", active: false, color: "border-tertiary/20 text-tertiary hover:bg-tertiary/10" },
  { label: "Showcase", active: false, color: "border-secondary/20 text-secondary hover:bg-secondary/10" },
  { label: "Deep Dives", active: false, color: "border-primary/20 text-primary hover:bg-primary/10" },
  { label: "Hardware", active: false, color: "border-white/10 text-white/60 hover:text-white" },
] as const;

const blogPosts = [
  {
    title: "Otimizando sua CLI para o Fluxo Máximo",
    excerpt:
      "Descubra como configurar seu terminal para reduzir a latência cognitiva e focar apenas no que importa: o código.",
    category: "Tutoriais",
    categoryColor: "bg-tertiary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(129,233,255,0.15)]",
    hoverText: "group-hover:text-tertiary",
    author: "André Santos",
    authorRole: "Admin",
    date: "15 Out 2023",
    readTime: "8 min",
    views: "1.2k",
    likes: 124,
    comments: 23,
  },
  {
    title: "Setup Minimalista em Portugal",
    excerpt:
      "Um olhar detalhado sobre o setup de um desenvolvedor do Porto focado em eficiência e ergonomia.",
    category: "Showcase",
    categoryColor: "bg-secondary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(216,115,255,0.15)]",
    hoverText: "group-hover:text-secondary",
    author: "Tiago Silva",
    authorRole: "Community",
    date: "12 Out 2023",
    readTime: "4 min",
    views: "850",
    likes: 88,
    comments: 12,
  },
  {
    title: "A Anatomia dos Keyboards Mecânicos",
    excerpt:
      "Entenda a física por trás dos switches e como escolher o melhor para longas sessões de coding.",
    category: "Deep Dives",
    categoryColor: "bg-primary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(161,255,194,0.15)]",
    hoverText: "group-hover:text-primary",
    author: "Marta Costa",
    authorRole: "Expert",
    date: "08 Out 2023",
    readTime: "15 min",
    views: "2.1k",
    likes: 342,
    comments: 56,
  },
  {
    title: "Segurança no Vibe Coding",
    excerpt:
      "Protocolos essenciais para manter seu ambiente de desenvolvimento seguro contra vulnerabilidades modernas.",
    category: "Tutoriais",
    categoryColor: "bg-tertiary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(129,233,255,0.15)]",
    hoverText: "group-hover:text-tertiary",
    author: "João Ferraz",
    authorRole: "Staff",
    date: "05 Out 2023",
    readTime: "10 min",
    views: "640",
    likes: 45,
    comments: 8,
  },
] as const;

export default function BlogPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Blog
        </h1>
        <p className="text-white/60 text-lg max-w-2xl border-l-2 border-primary pl-6">
          Artigos, tutoriais e deep dives sobre vibe coding.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex-shrink-0 transition-colors ${
                  cat.active
                    ? cat.color
                    : `bg-surface-container border ${cat.color}`
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
                placeholder="Pesquisar protocolo..."
                className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:ring-0 text-sm py-2 pl-10 pr-4 text-white placeholder:text-white/20 font-mono transition-all outline-none"
              />
            </div>
            <div className="relative">
              <select className="appearance-none bg-surface-container-lowest border border-white/5 focus:border-primary/50 focus:ring-0 text-xs font-mono py-2 pl-4 pr-10 text-white/60 uppercase cursor-pointer hover:text-white transition-colors outline-none">
                <option>Mais Recentes</option>
                <option>Mais Populares</option>
                <option>Mais Comentados</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Post Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.title}
            className={`group relative bg-surface-container rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 ${post.hoverShadow} flex flex-col`}
          >
            {/* Top color bar */}
            <div
              className={`absolute top-0 left-0 w-full h-[3px] ${post.categoryColor} z-10`}
            />

            {/* Image placeholder */}
            <div className="aspect-[16/9] overflow-hidden relative">
              <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container-low transition-transform duration-500 group-hover:scale-105 opacity-80" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10">
                <span className="font-mono text-[10px] text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 ${post.categoryColor} rounded-full animate-pulse`}
                  />
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h3
                className={`font-headline text-2xl font-bold text-white mb-3 ${post.hoverText} transition-colors`}
              >
                {post.title}
              </h3>
              <p className="text-white/50 text-sm line-clamp-2 mb-6">
                {post.excerpt}
              </p>

              {/* Author & meta */}
              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white uppercase">
                        {post.author}
                      </p>
                      <span className="text-[8px] bg-white/5 px-1.5 py-0.5 text-white/40 uppercase">
                        {post.authorRole}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 font-mono">
                      {post.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/40">
                  <span className="flex items-center gap-1 text-[10px] font-mono">
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono">
                    {post.views}
                  </span>
                </div>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-4 mt-4 justify-end">
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-mono hover:text-primary transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-mono hover:text-tertiary transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.comments}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-16 flex justify-center items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-primary/50 text-white/40 hover:text-primary transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary font-mono text-sm font-bold">
          01
        </button>
        <button className="w-10 h-10 flex items-center justify-center border border-white/5 hover:bg-white/5 text-white/60 font-mono text-sm transition-colors">
          02
        </button>
        <button className="w-10 h-10 flex items-center justify-center border border-white/5 hover:bg-white/5 text-white/60 font-mono text-sm transition-colors">
          03
        </button>
        <span className="text-white/20 mx-2">...</span>
        <button className="w-10 h-10 flex items-center justify-center border border-white/5 hover:bg-white/5 text-white/60 font-mono text-sm transition-colors">
          12
        </button>
        <button className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-primary/50 text-white/40 hover:text-primary transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
