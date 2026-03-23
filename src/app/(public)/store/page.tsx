import Link from "next/link";

export default function StorePage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      {/* Status indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="font-label text-[10px] tracking-widest text-secondary uppercase">
          System_Initializing
        </span>
      </div>

      <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
        Em{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
          Breve
        </span>
      </h1>

      <p className="text-on-surface-variant text-lg max-w-lg mx-auto mb-12 font-light">
        O marketplace da comunidade VibeTuga está em construção. Skills, auto-runners, agent kits,
        prompt packs e muito mais.
      </p>

      {/* Teaser items */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 w-full max-w-lg">
        {["Skills", "Auto Runners", "Agent Kits", "Prompt Packs", "Templates", "Cursos"].map(
          (item) => (
            <div key={item} className="bg-surface-container border border-white/5 p-4 text-center">
              <span className="font-label text-[10px] text-white/30 uppercase tracking-widest">
                {item}
              </span>
            </div>
          ),
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/newsletter"
          className="px-8 py-4 bg-secondary text-on-secondary font-bold font-headline uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(216,115,255,0.4)] transition-all"
        >
          Notifica-me
        </Link>
        <Link
          href="/"
          className="px-8 py-4 bg-transparent border border-white/10 text-white/60 font-bold hover:text-white hover:border-white/30 transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
