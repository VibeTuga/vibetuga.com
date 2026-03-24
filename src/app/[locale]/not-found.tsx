import { Link } from "@/lib/navigation";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-6 text-center">
      {/* 404 */}
      <div className="relative mb-8">
        <span
          className="font-headline font-black text-[10rem] md:text-[16rem] leading-none text-[#a1ffc2] select-none"
          style={{
            textShadow:
              "0 0 40px rgba(161,255,194,0.4), 0 0 80px rgba(161,255,194,0.2), 0 0 160px rgba(161,255,194,0.1)",
          }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-[#a1ffc2]/10" />
        </div>
      </div>

      {/* Terminal label */}
      <p className="font-mono text-[10px] text-[#a1ffc2]/50 uppercase tracking-[0.3em] mb-4">
        ERROR_CODE: PAGE_NOT_FOUND
      </p>

      {/* Message */}
      <h1 className="font-headline text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">
        Página não encontrada
      </h1>
      <p className="text-white/40 text-sm max-w-[400px] mb-10 font-mono">
        Esta página não existe ou foi movida. Verifica o URL ou volta ao início.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#a1ffc2] text-black font-bold text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(161,255,194,0.4)]"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Voltar ao início
      </Link>
    </div>
  );
}
