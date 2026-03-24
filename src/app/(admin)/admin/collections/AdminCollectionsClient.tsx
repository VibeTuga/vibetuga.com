"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star, ChevronDown, ChevronUp, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionWithCount } from "@/lib/db/queries/store";

type SimpleProduct = { id: string; title: string; productType: string };

type CollectionFormData = {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  isFeatured: boolean;
  sortOrder: number;
};

const emptyForm: CollectionFormData = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
  isFeatured: false,
  sortOrder: 0,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminCollectionsClient({
  initialCollections,
  availableProducts,
}: {
  initialCollections: CollectionWithCount[];
  availableProducts: SimpleProduct[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addProductId, setAddProductId] = useState("");
  const [productLoading, setProductLoading] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function startEdit(c: CollectionWithCount) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      coverImage: c.coverImage || "",
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
    });
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingId ? `/api/store/collections/${editingId}` : "/api/store/collections";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          coverImage: form.coverImage.trim() || null,
          isFeatured: form.isFeatured,
          sortOrder: form.sortOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao guardar coleção.");
        return;
      }

      cancelForm();
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tens a certeza que queres eliminar esta coleção?")) return;

    try {
      const res = await fetch(`/api/store/collections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao eliminar.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de rede.");
    }
  }

  async function handleAddProduct(collectionId: string) {
    if (!addProductId) return;
    setProductLoading(true);

    try {
      const res = await fetch(`/api/store/collections/${collectionId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: addProductId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar produto.");
        return;
      }

      setAddProductId("");
      router.refresh();
    } catch {
      alert("Erro de rede.");
    } finally {
      setProductLoading(false);
    }
  }

  async function handleRemoveProduct(collectionId: string, productId: string) {
    try {
      const res = await fetch(`/api/store/collections/${collectionId}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao remover produto.");
        return;
      }

      router.refresh();
    } catch {
      alert("Erro de rede.");
    }
  }

  return (
    <div>
      {/* Create button */}
      {!showForm && (
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all mb-8"
        >
          <Plus size={14} />
          Nova Coleção
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-surface-container border border-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-headline font-bold uppercase tracking-wider text-white">
              {editingId ? "Editar Coleção" : "Nova Coleção"}
            </h2>
            <button
              onClick={cancelForm}
              className="p-1 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingId ? form.slug : slugify(e.target.value),
                    });
                  }}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20"
                  placeholder="Melhores Agent Kits"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20"
                  placeholder="melhores-agent-kits"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20 resize-y"
                placeholder="Uma seleção curada dos melhores agent kits..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                URL da Imagem de Capa
              </label>
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                  Ordem
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-white/60">Destaque na loja</span>
                </label>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "A guardar..." : editingId ? "Guardar Alterações" : "Criar Coleção"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-3 text-white/40 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collections List */}
      {initialCollections.length === 0 ? (
        <div className="text-center py-20 border border-white/5 bg-surface-container-lowest">
          <Package size={48} className="text-white/10 mx-auto mb-6" />
          <h2 className="font-headline text-xl font-bold text-white mb-3">Sem coleções</h2>
          <p className="text-white/40 text-sm">
            Cria a primeira coleção para organizar os produtos da loja.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialCollections.map((c) => (
            <div key={c.id} className="bg-surface-container-lowest border border-white/5">
              {/* Collection Row */}
              <div className="flex items-center gap-4 p-4">
                <button
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  className="shrink-0 p-1 text-white/30 hover:text-white transition-colors"
                >
                  {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                    {c.isFeatured && (
                      <Star size={12} className="text-secondary fill-secondary shrink-0" />
                    )}
                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/40">
                      /{c.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
                    <span>
                      {c.productCount} {c.productCount === 1 ? "produto" : "produtos"}
                    </span>
                    <span>·</span>
                    <span>Ordem: {c.sortOrder}</span>
                  </div>
                </div>

                <button
                  onClick={() => startEdit(c)}
                  className="shrink-0 p-2 text-white/30 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 p-2 text-white/30 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded: Products Management */}
              {expandedId === c.id && (
                <div className="border-t border-white/5 p-4 bg-surface-container">
                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">
                    Produtos nesta coleção
                  </h4>

                  {/* Add product */}
                  <div className="flex gap-2 mb-4">
                    <select
                      value={addProductId}
                      onChange={(e) => setAddProductId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface-container-lowest text-white text-xs font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none"
                    >
                      <option value="">Selecionar produto...</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.productType})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddProduct(c.id)}
                      disabled={!addProductId || productLoading}
                      className={cn(
                        "shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all",
                        addProductId && !productLoading
                          ? "bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(161,255,194,0.3)]"
                          : "bg-white/5 text-white/20 cursor-not-allowed",
                      )}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-white/30 mb-2">
                    Para ver e remover produtos, visita{" "}
                    <a
                      href={`/store/collections/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tertiary hover:underline"
                    >
                      a página pública
                    </a>
                    . Para remover, usa o botão abaixo com o ID do produto.
                  </p>

                  <CollectionProductRemover
                    collectionId={c.id}
                    onRemove={handleRemoveProduct}
                    availableProducts={availableProducts}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionProductRemover({
  collectionId,
  onRemove,
  availableProducts,
}: {
  collectionId: string;
  onRemove: (collectionId: string, productId: string) => Promise<void>;
  availableProducts: SimpleProduct[];
}) {
  const [removeId, setRemoveId] = useState("");
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!removeId) return;
    setRemoving(true);
    await onRemove(collectionId, removeId);
    setRemoveId("");
    setRemoving(false);
  }

  return (
    <div className="flex gap-2">
      <select
        value={removeId}
        onChange={(e) => setRemoveId(e.target.value)}
        className="flex-1 px-3 py-2 bg-surface-container-lowest text-white text-xs font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none"
      >
        <option value="">Remover produto...</option>
        {availableProducts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
      <button
        onClick={handleRemove}
        disabled={!removeId || removing}
        className={cn(
          "shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all",
          removeId && !removing
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-white/5 text-white/20 cursor-not-allowed",
        )}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
