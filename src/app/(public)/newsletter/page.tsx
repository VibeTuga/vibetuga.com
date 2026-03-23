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

      {/* Email input styled as terminal prompt */}
      <div className="w-full max-w-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-mono text-sm">
              $
            </span>
            <input
              type="email"
              placeholder="teu@email.pt"
              className="w-full bg-surface-container-lowest border border-white/10 focus:border-primary/50 focus:ring-0 text-sm py-4 pl-8 pr-4 text-white placeholder:text-white/20 font-mono transition-all outline-none"
            />
          </div>
          <button className="px-8 py-4 bg-primary text-on-primary font-bold font-headline uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all flex-shrink-0">
            Subscrever
          </button>
        </div>
        <p className="text-[10px] text-white/20 font-mono mt-4 uppercase tracking-widest">
          Sem spam. Cancelar a qualquer momento.
        </p>
      </div>
    </div>
  );
}
