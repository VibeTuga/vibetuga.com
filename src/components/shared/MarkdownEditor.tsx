"use client";

import { useState } from "react";
import { MarkdownContent } from "@/components/blog/MarkdownContent";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  rows = 6,
  placeholder,
  id,
  disabled,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  const minHeight = `${rows * 1.5}rem`;

  return (
    <div className={className}>
      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-surface-container-lowest">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            tab === "write"
              ? "text-primary border-b-2 border-primary"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Escrever
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            tab === "preview"
              ? "text-primary border-b-2 border-primary"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Pré-visualizar
        </button>
      </div>

      {/* Content */}
      {tab === "write" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-surface-container-lowest border border-white/5 border-t-0 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-y transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ) : (
        <div
          className="border border-white/5 border-t-0 bg-surface-container-lowest p-4 overflow-auto"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <MarkdownContent content={value} className="prose prose-invert max-w-none" />
          ) : (
            <p className="text-white/20 italic text-sm">Nada para pré-visualizar</p>
          )}
        </div>
      )}
    </div>
  );
}
