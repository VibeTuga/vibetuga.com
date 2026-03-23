"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";

type Category = { id: string; name: string; slug: string; color: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SubmitPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const slug = slugify(title);
      const tagsArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          categoryId: categoryId || null,
          tags: tagsArr,
          status: "pending_review",
          postType: "community",
        }),
      });

      if (res.status === 401) {
        setError("Precisas de fazer login.");
        return;
      }

      if (res.status === 403) {
        // Any auth user should be able to submit - but the current API restricts to author+
        // For community submissions, we need to allow members too
        setError("Sem permissões. Contacta um admin.");
        return;
      }

      if (res.status === 409) {
        setError("Já existe um post com este título. Tenta outro.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao submeter.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao submeter post.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <CheckCircle size={48} className="text-primary mx-auto mb-6" />
        <h1 className="font-headline text-2xl font-bold text-white mb-4">Post Submetido!</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
          O teu post foi enviado para revisão. Um moderador irá analisá-lo em breve.
        </p>
        <button
          onClick={() => router.push("/blog")}
          className="px-6 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          Voltar ao Blog
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Submeter Post
        </h1>
        <p className="text-white/40 text-sm">
          Partilha o teu artigo com a comunidade. O post será revisado antes de ser publicado.
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
            placeholder="O título do teu artigo"
          />
          {title && (
            <p className="mt-1 text-[10px] font-mono text-white/20">slug: /{slugify(title)}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 text-white text-sm p-4 font-body transition-all outline-none"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Resumo
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-none transition-all outline-none"
            placeholder="Breve resumo do artigo (opcional)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Conteúdo *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 resize-y transition-all outline-none"
            placeholder="Escreve o conteúdo do teu artigo em HTML..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="react, ai, vibe-coding (separadas por vírgulas)"
          />
        </div>

        {error && <p className="text-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Submeter para Revisão
        </button>
      </form>
    </div>
  );
}
