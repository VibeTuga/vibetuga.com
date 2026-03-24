"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { RevisionHistory } from "@/components/blog/RevisionHistory";

interface Category {
  id: string;
  name: string;
}

interface PostFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string;
  coverImage: string;
  status: "draft" | "pending_review" | "published" | "archived";
  postType: "admin" | "community" | "guest";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogPostForm({
  categories,
  initialData,
}: {
  categories: Category[];
  initialData?: PostFormData;
}) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState<PostFormData>(
    initialData ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      categoryId: "",
      tags: "",
      coverImage: "",
      status: "draft",
      postType: "admin",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : slugify(title),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      categoryId: form.categoryId || null,
      tags,
      coverImage: form.coverImage || null,
      status: form.status,
      postType: form.postType,
    };

    try {
      const url = isEditing ? `/api/blog/posts/${initialData!.id}` : "/api/blog/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao guardar o post");
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Erro de rede ao guardar o post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 px-4 py-3 text-error text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
              Título
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
              placeholder="Título do artigo..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              required
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
              placeholder="url-do-artigo"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
              Excerto
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all resize-y"
              placeholder="Breve descrição do artigo..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
              Conteúdo
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              required
              rows={20}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all resize-y"
              placeholder="Escreve o conteúdo do artigo aqui... (Tiptap editor será adicionado mais tarde)"
            />
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as PostFormData["status"],
                }))
              }
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
            >
              <option value="draft">Rascunho</option>
              <option value="pending_review">Pendente</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>

            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Tipo de Post
            </label>
            <select
              value={form.postType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  postType: e.target.value as PostFormData["postType"],
                }))
              }
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
            >
              <option value="admin">Admin</option>
              <option value="community">Comunidade</option>
              <option value="guest">Convidado</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Categoria
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
              placeholder="react, nextjs, ia"
            />
            <p className="text-[9px] font-mono text-white/20 uppercase">Separar com vírgulas</p>
          </div>

          {/* Cover Image */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Imagem de Capa
            </label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
            />
          </div>

          {/* Revision History (edit mode only) */}
          {isEditing && initialData?.id && (
            <RevisionHistory
              postId={initialData.id}
              currentTitle={form.title}
              currentContent={form.content}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 px-4 py-3 border border-white/10 text-white/60 text-xs font-mono uppercase hover:border-white/20 hover:text-white transition-all"
            >
              <ArrowLeft size={14} />
              Voltar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "A guardar..." : isEditing ? "Atualizar" : "Criar Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
