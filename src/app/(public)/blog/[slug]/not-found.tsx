import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-24 text-center">
      <p className="font-mono text-[10px] text-[#a1ffc2]/50 uppercase tracking-[0.3em] mb-6">
        ERROR_CODE: POST_NOT_FOUND
      </p>

      <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
        Artigo não encontrado
      </h1>
      <p className="text-white/40 text-sm font-mono mb-10 max-w-[360px] mx-auto">
        Este artigo não existe ou foi removido. Explora outros artigos no blog.
      </p>

      <Link
        href="/blog"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a1ffc2] text-black font-bold text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(161,255,194,0.4)]"
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
        Ir para o Blog
      </Link>
    </div>
  );
}
