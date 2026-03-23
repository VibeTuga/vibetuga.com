"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TYPE_TABS = [
  { label: "Todos", value: "" },
  { label: "Skills", value: "skill" },
  { label: "Auto Runners", value: "auto_runner" },
  { label: "Agent Kits", value: "agent_kit" },
  { label: "Prompt Packs", value: "prompt_pack" },
  { label: "Templates", value: "template" },
  { label: "Cursos", value: "course" },
  { label: "Guides", value: "guide" },
];

export function StoreTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") ?? "";

  const handleTabClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("type", value);
      } else {
        params.delete("type");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [router, searchParams],
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
      {TYPE_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(tab.value)}
          className={`px-4 py-2 font-label text-[10px] font-black uppercase whitespace-nowrap transition-colors ${
            activeType === tab.value
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

export function StoreSearchInput() {
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
        placeholder="BUSCAR_PRODUTO..."
        className="w-full bg-surface-container-lowest border border-white/10 pl-10 pr-4 py-2 text-xs font-label text-white focus:border-tertiary focus:ring-0 transition-all outline-none"
      />
    </form>
  );
}
