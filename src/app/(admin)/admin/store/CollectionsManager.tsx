"use client";

import { useState } from "react";
import { Plus, Trash2, Star, StarOff } from "lucide-react";
import type { StoreCollection } from "@/lib/db/queries/store";

export function CollectionsManager({
  collections: initialCollections,
}: {
  collections: StoreCollection[];
}) {
  const [collections, setCollections] = useState(initialCollections);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/store/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          coverImage: coverImage.trim() || null,
          isFeatured: false,
          sortOrder: collections.length,
        }),
      });

      if (res.ok) {
        const collection = await res.json();
        setCollections((prev) => [...prev, { ...collection, productCount: 0 }]);
        setName("");
        setSlug("");
        setDescription("");
        setCoverImage("");
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFeatured(id: string, currentFeatured: boolean) {
    const res = await fetch(`/api/store/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !currentFeatured }),
    });

    if (res.ok) {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFeatured: !currentFeatured } : c)),
      );
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Eliminar esta coleção?")) return;

    const res = await fetch(`/api/store/collections/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono text-white/40 uppercase">
          {collections.length} {collections.length === 1 ? "coleção" : "coleções"}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
        >
          <Plus size={14} />
          Nova Coleção
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-surface-container border border-white/5 rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
                  );
                }}
                className="w-full bg-surface-container-lowest border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-primary/50 focus:outline-none"
                placeholder="Nome da coleção"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-primary/50 focus:outline-none"
                placeholder="nome-da-colecao"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-surface-container-lowest border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-primary/50 focus:outline-none resize-none"
              placeholder="Descrição opcional"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
              Imagem de Capa (URL)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-surface-container-lowest border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-primary/50 focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim() || !slug.trim()}
              className="px-6 py-2 bg-primary text-on-primary font-mono text-xs uppercase tracking-widest disabled:opacity-50 hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
            >
              {saving ? "A guardar..." : "Criar Coleção"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-white/40 font-mono text-xs uppercase hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {collections.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-mono text-white/30 uppercase tracking-widest py-3 px-4">
                  Nome
                </th>
                <th className="text-left text-[10px] font-mono text-white/30 uppercase tracking-widest py-3 px-4">
                  Slug
                </th>
                <th className="text-center text-[10px] font-mono text-white/30 uppercase tracking-widest py-3 px-4">
                  Produtos
                </th>
                <th className="text-center text-[10px] font-mono text-white/30 uppercase tracking-widest py-3 px-4">
                  Destaque
                </th>
                <th className="text-right text-[10px] font-mono text-white/30 uppercase tracking-widest py-3 px-4">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-sm font-bold text-white">{col.name}</td>
                  <td className="py-3 px-4 text-xs font-mono text-white/50">{col.slug}</td>
                  <td className="py-3 px-4 text-center text-xs font-mono text-white/50">
                    {col.productCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(col.id, col.isFeatured)}
                      className="text-white/40 hover:text-primary transition-colors"
                      title={col.isFeatured ? "Remover destaque" : "Destacar"}
                    >
                      {col.isFeatured ? (
                        <Star size={16} className="text-primary fill-primary" />
                      ) : (
                        <StarOff size={16} />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="text-white/30 hover:text-error transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !showForm && (
          <p className="text-center text-white/30 text-sm py-12">Nenhuma coleção criada.</p>
        )
      )}
    </div>
  );
}
