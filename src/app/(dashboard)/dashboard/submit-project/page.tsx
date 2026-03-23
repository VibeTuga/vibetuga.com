"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SubmitProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [aiToolsUsed, setAiToolsUsed] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const slug = slugify(title);
      const techStackArr = techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const aiToolsArr = aiToolsUsed
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/showcase/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          description: description.trim() || null,
          coverImage: coverImage.trim() || null,
          liveUrl: liveUrl.trim() || null,
          repoUrl: repoUrl.trim() || null,
          videoUrl: videoUrl.trim() || null,
          techStack: techStackArr,
          aiToolsUsed: aiToolsArr,
        }),
      });

      if (res.status === 401) {
        setError("Precisas de fazer login.");
        return;
      }

      if (res.status === 409) {
        setError("Já existe um projeto com este título. Tenta outro.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao submeter.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao submeter projeto.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <CheckCircle size={48} className="text-primary mx-auto mb-6" />
        <h1 className="font-headline text-2xl font-bold text-white mb-4">Projeto Submetido!</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
          O teu projeto foi enviado para revisão. Um moderador irá analisá-lo em breve.
        </p>
        <button
          onClick={() => router.push("/showcase")}
          className="px-6 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          Ver Showcase
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Submeter Projeto
        </h1>
        <p className="text-white/40 text-sm">
          Partilha o teu projeto com a comunidade. Será revisto antes de aparecer no showcase.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="O nome do teu projeto"
          />
          {title && (
            <p className="mt-1 text-[10px] font-mono text-white/20">
              slug: /showcase/{slugify(title)}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-none transition-all outline-none"
            placeholder="Descreve o teu projeto — o que faz, como foi construído, o que aprendeste..."
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            URL da Imagem de Capa
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="https://..."
          />
        </div>

        {/* Live URL */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            URL Live
          </label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="https://meuprojeto.com"
          />
        </div>

        {/* Repo URL */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Repositório
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="https://github.com/user/repo"
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            URL do Vídeo Demo
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Stack Técnica
          </label>
          <input
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="Next.js, TypeScript, PostgreSQL (separadas por vírgulas)"
          />
        </div>

        {/* AI Tools */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Ferramentas de IA Utilizadas
          </label>
          <input
            type="text"
            value={aiToolsUsed}
            onChange={(e) => setAiToolsUsed(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="Claude, Cursor, Copilot (separadas por vírgulas)"
          />
        </div>

        {error && <p className="text-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Submeter para Revisão
        </button>
      </form>
    </div>
  );
}
