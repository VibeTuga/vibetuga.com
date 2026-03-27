"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Plus, Trash2, Loader2, AlertTriangle, Globe, Lock, Pencil } from "lucide-react";

interface CollectionData {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me/collections");
      if (!res.ok) throw new Error("Erro ao carregar coleções");
      const data = await res.json();
      setCollections(data.collections);
    } catch {
      setError("Erro ao carregar coleções");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar coleção");
      }

      setName("");
      setDescription("");
      setIsPublic(false);
      setShowForm(false);
      await fetchCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar coleção");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/me/collections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao eliminar");
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Erro ao eliminar coleção");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(c: CollectionData) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description || "");
    setEditIsPublic(c.isPublic);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || editingId === null) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/me/collections/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          isPublic: editIsPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar coleção");
      }

      setEditingId(null);
      await fetchCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar coleção");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bookmark className="text-primary" size={24} />
            Coleções
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Organiza os teus posts, projetos e produtos favoritos em coleções.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Criar Coleção
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertTriangle size={16} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400 text-xs"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-4 bg-surface-container rounded-lg space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Nova Coleção
          </h2>

          <div>
            <label className="block text-xs text-white/50 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Favoritos, Inspiração, Para ler..."
              maxLength={100}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">
              Descrição <span className="text-white/30">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição da coleção..."
              rows={2}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                isPublic
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
              }`}
            >
              {isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {isPublic ? "Pública" : "Privada"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating && <Loader2 className="animate-spin" size={14} />}
              Criar Coleção
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setDescription("");
                setIsPublic(false);
              }}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Bookmark size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Ainda não tens coleções.</p>
          <p className="text-xs mt-1">Cria uma para organizar o teu conteúdo favorito.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.id} className="group relative">
              {editingId === collection.id ? (
                <form
                  onSubmit={handleSaveEdit}
                  className="p-4 bg-surface-container rounded-lg space-y-3"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-1.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    placeholder="Descrição..."
                    className="w-full px-3 py-1.5 bg-black/30 border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditIsPublic(!editIsPublic)}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-mono rounded transition-colors ${
                      editIsPublic
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {editIsPublic ? <Globe size={10} /> : <Lock size={10} />}
                    {editIsPublic ? "Pública" : "Privada"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || !editName.trim()}
                      className="px-3 py-1.5 bg-primary text-black text-xs font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? "A guardar..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <Link
                  href={`/dashboard/collections/${collection.id}`}
                  className="block p-4 bg-surface-container rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate pr-2">
                      {collection.name}
                    </h3>
                    <span
                      className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        collection.isPublic
                          ? "bg-primary/10 text-primary/70"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {collection.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                      {collection.isPublic ? "Pública" : "Privada"}
                    </span>
                  </div>
                  {collection.description && (
                    <p className="text-xs text-white/40 line-clamp-2 mb-3">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-white/30">
                    <span className="font-mono">
                      {collection.itemCount} {collection.itemCount === 1 ? "item" : "itens"}
                    </span>
                    <span>{formatDate(collection.updatedAt)}</span>
                  </div>
                </Link>
              )}

              {/* Action buttons */}
              {editingId !== collection.id && (
                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      startEdit(collection);
                    }}
                    className="p-1.5 text-white/30 hover:text-primary transition-colors bg-surface-container rounded"
                    title="Editar coleção"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(collection.id);
                    }}
                    disabled={deletingId === collection.id}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors bg-surface-container rounded disabled:opacity-50"
                    title="Eliminar coleção"
                  >
                    {deletingId === collection.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
