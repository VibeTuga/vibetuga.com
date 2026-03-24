"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-[500px] w-full text-center">
        {/* Terminal error header */}
        <div className="bg-[#131313] border border-red-500/20 px-4 py-2 mb-6 flex items-center gap-2 font-mono text-xs text-red-400/80">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>RUNTIME_ERROR</span>
          {error.digest && (
            <span className="ml-auto text-white/20 text-[10px]">#{error.digest}</span>
          )}
        </div>

        <h2 className="font-headline text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">
          Algo correu mal
        </h2>
        <p className="text-white/40 text-sm font-mono mb-8">
          Ocorreu um erro inesperado. Podes tentar novamente ou voltar mais tarde.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#a1ffc2] text-black font-bold text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(161,255,194,0.4)]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
