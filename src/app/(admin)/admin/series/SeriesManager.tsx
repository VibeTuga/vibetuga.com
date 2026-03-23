"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Search,
} from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  sortOrder: number;
  createdAt: Date;
  authorName: string | null;
  authorDisplayName: string | null;
  postCount: number;
}

interface SeriesPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  readingTimeMinutes: number;
  publishedAt: Date | null;
  status: string;
  order: number;
}

interface PostOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface SeriesForm {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const emptyForm: SeriesForm = {
  title: "",
  slug: "",
  description: "",
  coverImage: "",
  sortOrder: 0,
};

export function SeriesManager({ initialSeries }: { initialSeries: SeriesItem[] }) {
  const router = useRouter();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<SeriesForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Post management state
  const [managingSeriesSlug, setManagingSeriesSlug] = useState<string | null>(null);
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([]);
  const [allPosts, setAllPosts] = useState<PostOption[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);

  function openPostManager(slug: string) {
    cancel();
    setLoadingPosts(true);
    setManagingSeriesSlug(slug);
  }

  useEffect(() => {
    if (!managingSeriesSlug) return;

    let cancelled = false;

    async function load() {
      const [seriesRes, postsRes] = await Promise.all([
        fetch(`/api/blog/series/${managingSeriesSlug}`).catch(() => null),
        fetch("/api/blog/posts").catch(() => null),
      ]);
      if (cancelled) return;
      if (seriesRes?.ok) {
        const data = await seriesRes.json();
        setSeriesPosts(data.posts || []);
      }
      if (postsRes?.ok) {
        const data = await postsRes.json();
        setAllPosts(data);
      }
      setLoadingPosts(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [managingSeriesSlug]);

  function startNew() {
    setEditingSlug(null);
    setManagingSeriesSlug(null);
    setShowNew(true);
    setError("");
    setForm({ ...emptyForm, sortOrder: initialSeries.length });
  }

  function startEdit(s: SeriesItem) {
    setManagingSeriesSlug(null);
    setShowNew(false);
    setError("");
    setEditingSlug(s.slug);
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description ?? "",
      coverImage: s.coverImage ?? "",
      sortOrder: s.sortOrder,
    });
  }

  function cancel() {
    setEditingSlug(null);
    setShowNew(false);
    setManagingSeriesSlug(null);
    setForm(emptyForm);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      if (showNew) {
        const res = await fetch("/api/blog/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            description: form.description || undefined,
            coverImage: form.coverImage || undefined,
            sortOrder: form.sortOrder,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Erro ao criar série");
          setSaving(false);
          return;
        }
      } else if (editingSlug) {
        const res = await fetch(`/api/blog/series/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            newSlug: form.slug !== editingSlug ? form.slug : undefined,
            description: form.description || undefined,
            coverImage: form.coverImage || undefined,
            sortOrder: form.sortOrder,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Erro ao atualizar série");
          setSaving(false);
          return;
        }
      }

      cancel();
      router.refresh();
    } catch {
      setError("Erro de rede");
    }
    setSaving(false);
  }

  async function deleteSeries(slug: string) {
    if (!window.confirm("Eliminar esta série? Os posts não serão eliminados.")) return;

    try {
      const res = await fetch(`/api/blog/series/${slug}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {
      // ignore
    }
  }

  function movePost(idx: number, direction: -1 | 1) {
    const newPosts = [...seriesPosts];
    const target = idx + direction;
    if (target < 0 || target >= newPosts.length) return;
    [newPosts[idx], newPosts[target]] = [newPosts[target], newPosts[idx]];
    setSeriesPosts(newPosts);
  }

  function removePost(idx: number) {
    setSeriesPosts((prev) => prev.filter((_, i) => i !== idx));
  }

  function addPost(post: PostOption) {
    if (seriesPosts.some((p) => p.id === post.id)) return;
    setSeriesPosts((prev) => [
      ...prev,
      {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: null,
        coverImage: null,
        readingTimeMinutes: 0,
        publishedAt: null,
        status: post.status,
        order: prev.length + 1,
      },
    ]);
  }

  async function savePostOrder() {
    if (!managingSeriesSlug) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/blog/series/${managingSeriesSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: seriesPosts.map((p) => p.id),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao guardar ordem");
      } else {
        router.refresh();
      }
    } catch {
      setError("Erro de rede");
    }
    setSaving(false);
  }

  const filteredAvailablePosts = allPosts.filter(
    (p) =>
      !seriesPosts.some((sp) => sp.id === p.id) &&
      (postSearch === "" ||
        p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(postSearch.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Create New button */}
      <div className="flex justify-end">
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-background font-mono text-xs uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Nova Série
        </button>
      </div>

      {/* New/Edit form */}
      {(showNew || editingSlug) && (
        <div className="p-6 bg-surface-container border border-white/5 space-y-4">
          <h2 className="font-headline font-bold text-sm uppercase text-white">
            {showNew ? "Nova Série" : "Editar Série"}
          </h2>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                Título
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: showNew ? slugify(title) : f.slug,
                  }));
                }}
                className="w-full px-3 py-2 bg-surface-container-lowest border border-white/10 text-white text-sm font-mono focus:border-primary focus:outline-none"
                placeholder="Intro ao Vibe Coding"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-lowest border border-white/10 text-white text-sm font-mono focus:border-primary focus:outline-none"
                placeholder="intro-ao-vibe-coding"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-surface-container-lowest border border-white/10 text-white text-sm font-mono focus:border-primary focus:outline-none resize-y"
              placeholder="Aprende os fundamentos do vibe coding..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                Imagem de Capa
              </label>
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                Ordem
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 bg-surface-container-lowest border border-white/10 text-white text-sm font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancel}
              className="flex items-center gap-1 px-3 py-2 text-white/50 hover:text-white font-mono text-xs uppercase transition-colors"
            >
              <X size={14} />
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving || !form.title || !form.slug}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-background font-mono text-xs uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Post management panel */}
      {managingSeriesSlug && (
        <div className="p-6 bg-surface-container border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-sm uppercase text-white">
              Gerir Posts &mdash; {initialSeries.find((s) => s.slug === managingSeriesSlug)?.title}
            </h2>
            <button
              onClick={() => setManagingSeriesSlug(null)}
              className="text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 px-3 py-2">
              {error}
            </p>
          )}

          {loadingPosts ? (
            <div className="py-8 text-center text-white/30 font-mono text-xs">
              A carregar posts...
            </div>
          ) : (
            <>
              {/* Current posts in series */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-white/40 uppercase mb-2">
                  Posts na série ({seriesPosts.length})
                </p>
                {seriesPosts.length === 0 ? (
                  <p className="text-white/30 text-xs font-mono py-4 text-center">
                    Nenhum post nesta série. Adiciona posts em baixo.
                  </p>
                ) : (
                  seriesPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 bg-surface-container-low border border-white/5"
                    >
                      <GripVertical size={14} className="text-white/20 flex-shrink-0" />
                      <span className="text-primary font-mono text-xs font-bold w-6 text-center">
                        {idx + 1}
                      </span>
                      <span className="text-white text-sm flex-1 truncate">{post.title}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ${
                          post.status === "published"
                            ? "text-green-400 bg-green-400/10"
                            : "text-yellow-400 bg-yellow-400/10"
                        }`}
                      >
                        {post.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => movePost(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-white/30 hover:text-primary disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => movePost(idx, 1)}
                          disabled={idx === seriesPosts.length - 1}
                          className="p-1 text-white/30 hover:text-primary disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => removePost(idx)}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add posts */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] font-mono text-white/40 uppercase mb-2">Adicionar post</p>
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-lowest border border-white/10 text-white text-sm font-mono focus:border-primary focus:outline-none"
                    placeholder="Procurar posts..."
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredAvailablePosts.length === 0 ? (
                    <p className="text-white/20 text-xs font-mono py-2 text-center">
                      Nenhum post disponível
                    </p>
                  ) : (
                    filteredAvailablePosts.slice(0, 20).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => addPost(post)}
                        className="w-full flex items-center gap-3 p-2 text-left hover:bg-surface-container-high transition-colors group"
                      >
                        <Plus
                          size={14}
                          className="text-white/20 group-hover:text-primary flex-shrink-0"
                        />
                        <span className="text-white/60 text-sm truncate group-hover:text-white">
                          {post.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ml-auto flex-shrink-0 ${
                            post.status === "published"
                              ? "text-green-400 bg-green-400/10"
                              : "text-yellow-400 bg-yellow-400/10"
                          }`}
                        >
                          {post.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={savePostOrder}
                  disabled={saving}
                  className="flex items-center gap-1 px-4 py-2 bg-primary text-background font-mono text-xs uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {saving ? "A guardar..." : "Guardar Ordem"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Series list */}
      {initialSeries.length === 0 && !showNew ? (
        <div className="py-16 text-center">
          <BookOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 font-mono text-sm">Nenhuma série criada.</p>
          <p className="text-white/20 font-mono text-xs mt-1">
            Cria a primeira série para agrupar posts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {initialSeries.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 bg-surface-container border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-primary font-mono text-xs font-bold w-6 text-center">
                {s.sortOrder}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-headline font-bold text-sm truncate">{s.title}</h3>
                <p className="text-white/30 font-mono text-[10px] truncate">
                  /{s.slug} &middot; {s.authorDisplayName || s.authorName} &middot; {s.postCount}{" "}
                  {s.postCount === 1 ? "post" : "posts"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openPostManager(s.slug)}
                  className="p-2 text-white/30 hover:text-primary transition-colors"
                  title="Gerir posts"
                >
                  <BookOpen size={16} />
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="p-2 text-white/30 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteSeries(s.slug)}
                  className="p-2 text-white/30 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
