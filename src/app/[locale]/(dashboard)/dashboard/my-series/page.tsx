"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Trash2, GripVertical, X, ChevronDown } from "lucide-react";

type Series = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  postCount: number;
  createdAt: string;
};

type SeriesDetail = Series & {
  posts: {
    id: string;
    seriesPostId: number;
    title: string;
    slug: string;
    order: number;
    status: string;
  }[];
};

type UserPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function MySeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesDetail | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Posts management
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [addingPostId, setAddingPostId] = useState("");
  const [showAddPost, setShowAddPost] = useState(false);

  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      if (!res.ok) return;
      const user = await res.json();

      const seriesRes = await fetch("/api/blog/series?page=1");
      if (!seriesRes.ok) return;
      const data = await seriesRes.json();
      const mySeries = data.series.filter(
        (s: Series & { authorId: string }) => s.authorId === user.id,
      );
      setSeriesList(mySeries);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const fetchSeriesDetail = async (id: number) => {
    const res = await fetch(`/api/blog/series/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setEditingSeries(data);
  };

  const fetchUserPosts = async () => {
    const res = await fetch("/api/blog/posts");
    if (!res.ok) return;
    const posts = await res.json();
    setUserPosts(posts.filter((p: { status: string }) => p.status === "published"));
  };

  const resetForm = () => {
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormCoverImage("");
    setError("");
    setShowForm(false);
    setEditingSeries(null);
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formSlug.trim()) {
      setError("Título e slug são obrigatórios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/blog/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          description: formDescription.trim() || null,
          coverImage: formCoverImage.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar série");
        return;
      }
      resetForm();
      fetchSeries();
    } catch {
      setError("Erro ao criar série");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSeries) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/series/${editingSeries.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          description: formDescription.trim() || null,
          coverImage: formCoverImage.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar série");
        return;
      }
      resetForm();
      fetchSeries();
    } catch {
      setError("Erro ao atualizar série");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem a certeza que quer eliminar esta série?")) return;
    try {
      await fetch(`/api/blog/series/${id}`, { method: "DELETE" });
      fetchSeries();
      if (editingSeries?.id === id) resetForm();
    } catch {
      // ignore
    }
  };

  const handleEdit = async (series: Series) => {
    setFormTitle(series.title);
    setFormSlug(series.slug);
    setFormDescription(series.description || "");
    setFormCoverImage(series.coverImage || "");
    setShowForm(true);
    await fetchSeriesDetail(series.id);
    await fetchUserPosts();
  };

  const handleAddPost = async () => {
    if (!editingSeries || !addingPostId) return;
    try {
      const res = await fetch(`/api/blog/series/${editingSeries.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: addingPostId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao adicionar post");
        return;
      }
      setAddingPostId("");
      setShowAddPost(false);
      await fetchSeriesDetail(editingSeries.id);
      fetchSeries();
    } catch {
      setError("Erro ao adicionar post");
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!editingSeries) return;
    try {
      await fetch(`/api/blog/series/${editingSeries.id}/posts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      await fetchSeriesDetail(editingSeries.id);
      fetchSeries();
    } catch {
      // ignore
    }
  };

  const handleMovePost = async (index: number, direction: "up" | "down") => {
    if (!editingSeries) return;
    const posts = [...editingSeries.posts];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    // Swap orders
    const postOrders = posts.map((p, i) => {
      if (i === index) return { id: p.seriesPostId, order: posts[targetIndex].order };
      if (i === targetIndex) return { id: p.seriesPostId, order: posts[index].order };
      return { id: p.seriesPostId, order: p.order };
    });

    try {
      await fetch(`/api/blog/series/${editingSeries.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postOrders }),
      });
      await fetchSeriesDetail(editingSeries.id);
    } catch {
      // ignore
    }
  };

  const postsInSeries = editingSeries?.posts.map((p) => p.id) || [];
  const availablePosts = userPosts.filter((p) => !postsInSeries.includes(p.id));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded" />
        <div className="h-32 bg-white/5 animate-pulse rounded" />
        <div className="h-32 bg-white/5 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-black text-white tracking-tight">
            Minhas Séries
          </h1>
          <p className="text-sm text-white/40 mt-1">Agrupe posts em séries ordenadas</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
            fetchUserPosts();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
        >
          <Plus size={14} />
          Nova Série
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-surface-container p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-white">
              {editingSeries ? "Editar Série" : "Nova Série"}
            </h2>
            <button
              onClick={resetForm}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="text-xs font-mono text-red-400 bg-red-400/10 px-3 py-2">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
                Título
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (!editingSeries) setFormSlug(slugify(e.target.value));
                }}
                className="w-full bg-surface-container-lowest text-white text-sm px-3 py-2 border border-white/10 focus:border-primary focus:outline-none"
                placeholder="Intro ao Vibe Coding"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(slugify(e.target.value))}
                className="w-full bg-surface-container-lowest text-white text-sm px-3 py-2 border border-white/10 focus:border-primary focus:outline-none font-mono"
                placeholder="intro-ao-vibe-coding"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Descrição
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-surface-container-lowest text-white text-sm px-3 py-2 border border-white/10 focus:border-primary focus:outline-none resize-y min-h-[80px]"
              placeholder="Uma série sobre..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Imagem de Capa (URL)
            </label>
            <input
              type="text"
              value={formCoverImage}
              onChange={(e) => setFormCoverImage(e.target.value)}
              className="w-full bg-surface-container-lowest text-white text-sm px-3 py-2 border border-white/10 focus:border-primary focus:outline-none font-mono"
              placeholder="https://..."
            />
          </div>

          {/* Posts in series (edit mode only) */}
          {editingSeries && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  Posts na Série ({editingSeries.posts.length})
                </label>
                <button
                  onClick={() => setShowAddPost(!showAddPost)}
                  className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus size={12} />
                  Adicionar Post
                </button>
              </div>

              {showAddPost && availablePosts.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={addingPostId}
                      onChange={(e) => setAddingPostId(e.target.value)}
                      className="w-full bg-surface-container-lowest text-white text-sm px-3 py-2 border border-white/10 focus:border-primary focus:outline-none appearance-none pr-8"
                    >
                      <option value="">Selecionar post...</option>
                      {availablePosts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    />
                  </div>
                  <button
                    onClick={handleAddPost}
                    disabled={!addingPostId}
                    className="px-3 py-2 bg-primary text-black text-xs font-mono font-bold uppercase disabled:opacity-50 hover:bg-primary/80 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              )}

              {showAddPost && availablePosts.length === 0 && (
                <p className="text-xs text-white/30 font-mono">
                  Todos os seus posts publicados já estão na série.
                </p>
              )}

              {editingSeries.posts.length === 0 ? (
                <p className="text-xs text-white/30 font-mono py-4 text-center">
                  Nenhum post na série. Adicione posts publicados acima.
                </p>
              ) : (
                <div className="space-y-1">
                  {editingSeries.posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 px-3 py-2 bg-surface-container-lowest border border-white/5 group"
                    >
                      <span className="text-xs font-mono text-white/30 w-6 text-center">
                        {index + 1}
                      </span>
                      <GripVertical size={14} className="text-white/20" />
                      <span className="text-sm text-white flex-1 truncate">{post.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMovePost(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 text-xs"
                          title="Mover para cima"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMovePost(index, "down")}
                          disabled={index === editingSeries.posts.length - 1}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 text-xs"
                          title="Mover para baixo"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleRemovePost(post.id)}
                          className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                          title="Remover da série"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={editingSeries ? handleUpdate : handleCreate}
              disabled={saving}
              className="px-6 py-2 bg-primary text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? "A guardar..." : editingSeries ? "Guardar Alterações" : "Criar Série"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-xs font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Series List */}
      {seriesList.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 font-mono text-sm">
            Ainda não tem séries. Crie a sua primeira!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className="flex items-center justify-between p-4 bg-surface-container rounded-sm border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-bold text-white truncate">{series.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] font-mono text-white/30">/{series.slug}</span>
                  <span className="text-[10px] font-mono text-primary">
                    {series.postCount} {series.postCount === 1 ? "post" : "posts"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(series)}
                  className="px-3 py-1.5 text-xs font-mono text-white/50 hover:text-primary border border-white/10 hover:border-primary/30 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(series.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  title="Eliminar série"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
