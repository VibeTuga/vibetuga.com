"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/navigation";
import { ChevronLeft, Save } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setError("Assunto e conteúdo são obrigatórios.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), content: content.trim() }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        router.push("/admin/newsletter");
        router.refresh();
      } else {
        setStatus("error");
        setError(data.error ?? "Erro ao guardar campanha.");
      }
    } catch {
      setStatus("error");
      setError("Erro de ligação. Tenta novamente.");
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/newsletter" className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
            Nova Campanha
          </h1>
          <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
            Guardada como rascunho — envio via Resend (em breve)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Assunto *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: VibeTuga Weekly #01 — Os melhores projetos da semana"
            maxLength={255}
            required
            className="w-full bg-surface-container-lowest border border-white/10 focus:border-primary/50 text-sm py-3 px-4 text-white placeholder:text-white/20 font-mono outline-none transition-all"
          />
          <p className="text-[9px] font-mono text-white/20 mt-1 text-right">{subject.length}/255</p>
        </div>

        {/* Content */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Conteúdo *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreve o conteúdo da campanha aqui. Suporta texto simples ou HTML básico."
            rows={16}
            required
            className="w-full bg-surface-container-lowest border border-white/10 focus:border-primary/50 text-sm py-3 px-4 text-white placeholder:text-white/20 font-mono outline-none transition-all resize-y"
          />
        </div>

        {error && (
          <div className="border border-error/30 bg-error/5 px-4 py-3">
            <p className="font-mono text-error text-xs uppercase tracking-widest">[ERR] {error}</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-tight hover:shadow-[0_0_20px_rgba(161,255,194,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            {status === "loading" ? "A guardar..." : "Guardar Rascunho"}
          </button>
          <Link
            href="/admin/newsletter"
            className="px-6 py-3 border border-white/10 text-white/40 font-headline font-bold uppercase text-xs tracking-tight hover:border-white/20 hover:text-white/60 transition-all"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
