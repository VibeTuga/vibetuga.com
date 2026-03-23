"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Clock, Check } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/shared/ImageUpload";

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
  scheduledAt: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AUTOSAVE_LOCAL_INTERVAL = 30_000; // 30 seconds
const AUTOSAVE_SERVER_INTERVAL = 60_000; // 60 seconds

function getLocalStorageKey(postId: string) {
  return `vibetuga_draft_${postId}`;
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
      scheduledAt: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [localDraft, setLocalDraft] = useState<{
    title: string;
    content: string;
    savedAt: number;
  } | null>(null);

  const isDirtyRef = useRef(false);
  const formRef = useRef(form);
  formRef.current = form;

  // Track dirty state
  useEffect(() => {
    if (!initialData) return;
    const changed = form.title !== initialData.title || form.content !== initialData.content;
    isDirtyRef.current = changed;
  }, [form.title, form.content, initialData]);

  // Check for local draft on mount
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const key = getLocalStorageKey(initialData.id);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const draft = JSON.parse(raw) as { title: string; content: string; savedAt: number };
      // Only offer restore if the local draft is newer and different
      if (
        draft.savedAt &&
        (draft.title !== initialData.title || draft.content !== initialData.content)
      ) {
        setLocalDraft(draft);
        setShowDraftRestore(true);
      }
    } catch {
      // Invalid draft, ignore
    }
  }, [isEditing, initialData]);

  // Local autosave (localStorage every 30s)
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const key = getLocalStorageKey(initialData.id);

    const interval = setInterval(() => {
      if (!isDirtyRef.current) return;
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            title: formRef.current.title,
            content: formRef.current.content,
            savedAt: Date.now(),
          }),
        );
      } catch {
        // Storage full or unavailable
      }
    }, AUTOSAVE_LOCAL_INTERVAL);

    return () => clearInterval(interval);
  }, [isEditing, initialData?.id]);

  // Server autosave (every 60s)
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;

    const interval = setInterval(async () => {
      if (!isDirtyRef.current) return;
      setAutosaveStatus("saving");
      try {
        const res = await fetch(`/api/blog/posts/${initialData.id}/autosave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formRef.current.title,
            content: formRef.current.content,
          }),
        });
        if (res.ok) {
          setAutosaveStatus("saved");
          isDirtyRef.current = false;
          setTimeout(() => setAutosaveStatus("idle"), 3000);
        } else {
          setAutosaveStatus("idle");
        }
      } catch {
        setAutosaveStatus("idle");
      }
    }, AUTOSAVE_SERVER_INTERVAL);

    return () => clearInterval(interval);
  }, [isEditing, initialData?.id]);

  const restoreLocalDraft = useCallback(() => {
    if (!localDraft) return;
    setForm((prev) => ({ ...prev, title: localDraft.title, content: localDraft.content }));
    setShowDraftRestore(false);
    isDirtyRef.current = true;
  }, [localDraft]);

  const dismissDraftRestore = useCallback(() => {
    setShowDraftRestore(false);
    if (initialData?.id) {
      try {
        localStorage.removeItem(getLocalStorageKey(initialData.id));
      } catch {
        // ignore
      }
    }
  }, [initialData?.id]);

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
      status: form.status,
      postType: form.postType,
    };

    // Include scheduledAt if set
    if (form.scheduledAt) {
      body.scheduledAt = form.scheduledAt;
    } else {
      body.scheduledAt = null;
    }

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
        try {
          localStorage.removeItem(getLocalStorageKey(initialData.id));
        } catch {
          // ignore
        }
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

      {/* Local draft restore banner */}
      {showDraftRestore && localDraft && (
        <div className="bg-tertiary/10 border border-tertiary/20 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs font-mono text-tertiary">
            Rascunho local encontrado ({new Date(localDraft.savedAt).toLocaleString("pt-PT")}).
            Restaurar?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreLocalDraft}
              className="px-3 py-1.5 bg-tertiary text-on-tertiary text-[10px] font-mono uppercase font-bold hover:shadow-[0_0_10px_rgba(150,120,255,0.4)] transition-all"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={dismissDraftRestore}
              className="px-3 py-1.5 border border-white/10 text-white/40 text-[10px] font-mono uppercase hover:text-white/60 transition-all"
            >
              Descartar
            </button>
          </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
                Conteúdo
              </label>
              {isEditing && autosaveStatus !== "idle" && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
                  {autosaveStatus === "saving" && (
                    <>
                      <Clock size={10} className="animate-spin" />A guardar...
                    </>
                  )}
                  {autosaveStatus === "saved" && (
                    <>
                      <Check size={10} className="text-primary" />
                      Guardado automaticamente
                    </>
                  )}
                </span>
              )}
            </div>
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

          {/* Scheduled Publishing */}
          <div className="bg-surface-container p-4 space-y-4">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
              Agendar Publicação
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all [color-scheme:dark]"
            />
            {form.scheduledAt && (
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-tertiary uppercase flex items-center gap-1">
                  <Clock size={10} />
                  Publicação agendada
                </p>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, scheduledAt: "" }))}
                  className="text-[9px] font-mono text-white/30 uppercase hover:text-white/60 transition-all"
                >
                  Limpar
                </button>
              </div>
            )}
            <p className="text-[9px] font-mono text-white/20 uppercase">
              Post será publicado automaticamente na data selecionada
            </p>
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
