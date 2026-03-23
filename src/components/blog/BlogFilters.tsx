"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const q = formData.get("q") as string;
      const params = new URLSearchParams(searchParams.toString());

      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [router, searchParams],
  );

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 md:w-64">
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
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Pesquisar protocolo..."
        className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:ring-0 text-sm py-2 pl-10 pr-4 text-white placeholder:text-white/20 font-mono transition-all outline-none"
      />
    </form>
  );
}

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const value = e.target.value;

      if (value && value !== "latest") {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      params.delete("page");

      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [router, searchParams],
  );

  return (
    <div className="relative">
      <select
        defaultValue={searchParams.get("sort") ?? "latest"}
        onChange={handleChange}
        className="appearance-none bg-surface-container-lowest border border-white/5 focus:border-primary/50 focus:ring-0 text-xs font-mono py-2 pl-4 pr-10 text-white/60 uppercase cursor-pointer hover:text-white transition-colors outline-none"
      >
        <option value="latest">Mais Recentes</option>
        <option value="popular">Mais Populares</option>
        <option value="oldest">Mais Antigos</option>
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
  );
}
