"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Loader2 } from "lucide-react";
import { formatDatePT } from "@/lib/blog-utils";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
  authorName: string | null;
  authorDisplayName: string | null;
  publishedAt: string | null;
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cmd+K shortcut + custom event from SearchTrigger
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenSearch() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", onOpenSearch);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  function navigateTo(slug: string) {
    setOpen(false);
    router.push(`/blog/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateTo(results[selectedIndex].slug);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative max-w-[640px] mx-auto mt-[15vh] bg-surface-container-high/95 backdrop-blur-xl border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)] animate-scale-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search size={18} className="text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pesquisar artigos..."
            className="flex-1 bg-transparent text-white text-sm font-body placeholder:text-white/20 outline-none"
          />
          {loading && <Loader2 size={16} className="animate-spin text-white/20 flex-shrink-0" />}
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 text-[10px] font-mono text-white/20 border border-white/10 px-2 py-1 hover:text-white/40 transition-colors"
          >
            <X size={12} />
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((result, i) => {
                const author = result.authorDisplayName || result.authorName || "Anónimo";
                return (
                  <li key={result.id}>
                    <button
                      onClick={() => navigateTo(result.slug)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors ${
                        i === selectedIndex ? "bg-primary/10" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <FileText
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${
                          i === selectedIndex ? "text-primary" : "text-white/20"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-headline font-bold truncate ${
                            i === selectedIndex ? "text-primary" : "text-white"
                          }`}
                        >
                          {result.title}
                        </p>
                        {result.excerpt && (
                          <p className="text-xs text-white/30 line-clamp-1 mt-0.5">
                            {result.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {result.categoryName && (
                            <span
                              className="text-[9px] font-mono uppercase"
                              style={{ color: result.categoryColor ?? undefined }}
                            >
                              {result.categoryName}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-white/15">
                            {author} ·{" "}
                            {result.publishedAt ? formatDatePT(new Date(result.publishedAt)) : ""}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.length >= 2 && !loading ? (
            <div className="py-12 text-center">
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                NO_RESULTS
              </p>
              <p className="text-white/20 text-sm mt-2">
                Nenhum resultado para &quot;{query}&quot;
              </p>
            </div>
          ) : !query ? (
            <div className="py-12 text-center">
              <p className="text-white/20 text-sm">Começa a escrever para pesquisar...</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/15">↑↓ navegar</span>
          <span className="text-[10px] font-mono text-white/15">↵ abrir</span>
          <span className="text-[10px] font-mono text-white/15">esc fechar</span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger() {
  function handleClick() {
    window.dispatchEvent(new CustomEvent("open-search"));
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 bg-surface-container border border-white/5 hover:border-white/10 hover:text-white/50 transition-colors"
      aria-label="Pesquisar (Cmd+K)"
    >
      <Search size={14} />
      <span className="hidden sm:inline font-mono text-[10px]">Pesquisar</span>
      <kbd className="hidden sm:inline text-[9px] font-mono bg-white/5 px-1.5 py-0.5 text-white/20">
        ⌘K
      </kbd>
    </button>
  );
}
