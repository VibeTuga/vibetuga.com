"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { RevisionHistory } from "@/components/blog/RevisionHistory";
import { useAutosave, getLocalDraft, clearLocalDraft } from "@/hooks/useAutosave";

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
  scheduledPublishAt?: string;
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
  const [localDraftPrompt, setLocalDraftPrompt] = useState<{
    title: string;
    content: string;
    savedAt: string;
  } | null>(null);

  // Autosave hook (only active in edit mode)
  const { status: autosaveStatus, lastSavedAt: autosaveLastSaved } = useAutosave(
    initialData?.id,
    form.title,
    form.content,
    isEditing,
  );

  // Check for localStorage draft on mount (edit mode only)
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const draft = getLocalDraft(initialData.id);
    if (!draft) return;

    // Only prompt if local draft is different from current server data
    const isDifferent = draft.title !== initialData.title || draft.content !== initialData.content;
    if (isDifferent) {
      setLocalDraftPrompt(draft);
    } else {
      clearLocalDraft(initialData.id);
    }
  }, [isEditing, initialData?.id, initialData?.title, initialData?.content]);

  function restoreLocalDraft() {
    if (!localDraftPrompt || !initialData?.id) return;
    setForm((prev) => ({
      ...prev,
      title: localDraftPrompt.title,
      content: localDraftPrompt.content,
    }));
    clearLocalDraft(initialData.id);
    setLocalDraftPrompt(null);
  }

  function dismissLocalDraft() {
    if (!initialData?.id) return;
    clearLocalDraft(initialData.id);
    setLocalDraftPrompt(null);
  }

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

    const body: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      categoryId: form.categoryId || null,
      tags,
      coverImage: form.coverImage || null,
      status: form.scheduledPublishAt ? "draft" : form.status,
      postType: form.postType,
      scheduledPublishAt: form.scheduledPublishAt || null,
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

      // Clear local draft on successful save
      if (initialData?.id) {
        clearLocalDraft(initialData.id);
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
      {/* Local draft restore prompt */}
      {localDraftPrompt && (
        <div className="bg-tertiary/10 border border-tertiary/20 px-4 py-3 text-xs font-mono flex items-center justify-between gap-4">
          <span className="text-tertiary">
            Existe um rascunho local mais recente (guardado{" "}
            {new Date(localDraftPrompt.savedAt).toLocaleString("pt-PT")}). Restaurar?
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreLocalDraft}
              className="px-3 py-1 bg-tertiary text-on-primary text-[10px] uppercase font-bold hover:opacity-80 transition-opacity"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={dismissLocalDraft}
              className="px-3 py-1 border border-white/10 text-white/40 text-[10px] uppercase hover:text-white/60 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

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
            <MarkdownEditor
              value={form.content}
              onChange={(content) => setForm((prev) => ({ ...prev, content }))}
              rows={20}
              placeholder="Escreve o conteúdo do artigo aqui em Markdown..."
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

          {/* Scheduled Publishing */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Publicar Agendado
            </label>
            <input
              type="datetime-local"
              value={form.scheduledPublishAt ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  scheduledPublishAt: e.target.value || undefined,
                }))
              }
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all [color-scheme:dark]"
            />
            {form.scheduledPublishAt && (
              <div className="flex items-center gap-2 text-tertiary text-[10px] font-mono uppercase">
                <Calendar size={12} />
                Agendado para {new Date(form.scheduledPublishAt).toLocaleString("pt-PT")}
              </div>
            )}
            <p className="text-[9px] font-mono text-white/20 uppercase">
              Deixar vazio para publicação manual
            </p>
          </div>

          {/* Revision History (edit mode only) */}
          {isEditing && initialData?.id && (
            <RevisionHistory
              postId={initialData.id}
              currentTitle={form.title}
              currentContent={form.content}
            />
          )}

          {/* Autosave status (edit mode only) */}
          {isEditing && (
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-1">
              <Clock size={12} className="text-white/30" />
              {autosaveStatus === "saving" && (
                <span className="text-tertiary animate-pulse">A guardar...</span>
              )}
              {autosaveStatus === "saved" && autosaveLastSaved && (
                <span className="text-white/30">
                  Guardado{" "}
                  {autosaveLastSaved.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {autosaveStatus === "error" && <span className="text-error">Autosave falhou</span>}
              {autosaveStatus === "idle" && <span className="text-white/20">Autosave ativo</span>}
            </div>
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
            {form.scheduledPublishAt ? (
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-tertiary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
              >
                <Calendar size={14} />
                {saving ? "A agendar..." : "Agendar Publicação"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "A guardar..." : isEditing ? "Atualizar" : "Criar Post"}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
