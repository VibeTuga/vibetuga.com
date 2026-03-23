"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";

const TECH_TABS = [
  { label: "Todos", value: "" },
  { label: "SaaS", value: "SaaS" },
  { label: "Tools", value: "Tools" },
  { label: "Games", value: "Games" },
  { label: "Art", value: "Art" },
  { label: "AI Agents", value: "AI Agents" },
];

export function ShowcaseTechFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTech = searchParams.get("tech") ?? "";

  const handleTabClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("tech", value);
      } else {
        params.delete("tech");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [router, searchParams],
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
      {TECH_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(tab.value)}
          className={`px-4 py-2 font-label text-[10px] font-black uppercase whitespace-nowrap transition-colors ${
            activeTech === tab.value
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-white/60 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ShowcaseSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const q = (formData.get("q") as string).trim();
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
        placeholder="BUSCAR_PROJECTO..."
        className="w-full bg-surface-container-lowest border border-white/10 pl-10 pr-4 py-2 text-xs font-label text-white focus:border-tertiary focus:ring-0 transition-all outline-none"
      />
    </form>
  );
}

export function SubmitProjectFAB() {
  return (
    <Link
      href="/dashboard/submit-project"
      className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 group"
    >
      <div className="flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-[0_0_20px_rgba(161,255,194,0.4)] hover:shadow-[0_0_30px_rgba(161,255,194,0.6)] transition-all duration-300">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-headline font-black text-sm uppercase tracking-tighter">
          Submeter Projeto
        </span>
      </div>
    </Link>
  );
}
