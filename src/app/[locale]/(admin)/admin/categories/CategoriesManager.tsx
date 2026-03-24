"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
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

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  color: "#a1ffc2",
  icon: "",
  sortOrder: 0,
};

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setShowNew(false);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      color: cat.color,
      icon: cat.icon ?? "",
      sortOrder: cat.sortOrder,
    });
  }

  function startNew() {
    setEditingId(null);
    setShowNew(true);
    setForm({
      ...emptyForm,
      sortOrder: initialCategories.length,
    });
  }

  function cancel() {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        ...form,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        icon: form.icon || null,
      };

      const res = editingId
        ? await fetch(`/api/blog/categories/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/blog/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        alert("Erro ao guardar a categoria");
        return;
      }

      cancel();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminar categoria "${name}"?`)) return;

    const res = await fetch(`/api/blog/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Erro ao eliminar a categoria");
      return;
    }
    router.refresh();
  }

  function renderForm() {
    return (
      <tr className="border-b border-white/[0.03] bg-surface-container">
        <td className="px-6 py-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                slug: editingId ? prev.slug : slugify(name),
              }));
            }}
            className="w-full bg-surface-container-lowest border border-white/10 px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none"
            placeholder="Nome"
          />
        </td>
        <td className="px-6 py-3">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full bg-surface-container-lowest border border-white/10 px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none"
            placeholder="slug"
          />
        </td>
        <td className="px-6 py-3">
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            className="w-8 h-8 bg-transparent border border-white/10 cursor-pointer"
          />
        </td>
        <td className="px-6 py-3">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                sortOrder: parseInt(e.target.value) || 0,
              }))
            }
            className="w-16 bg-surface-container-lowest border border-white/10 px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none text-center"
          />
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="p-2 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
              title="Guardar"
            >
              <Check size={14} />
            </button>
            <button
              onClick={cancel}
              className="p-2 text-white/40 hover:text-error hover:bg-error/10 transition-all"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={startNew}
          disabled={showNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      <div className="bg-surface-container-low overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Nome
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Slug
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Cor
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Ordem
              </th>
              <th className="text-right px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {showNew && renderForm()}
            {initialCategories.map((cat) =>
              editingId === cat.id ? (
                renderForm()
              ) : (
                <tr
                  key={cat.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-white">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-white/40">/{cat.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-mono text-white/40">{cat.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-white/40">{cat.sortOrder}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 text-white/40 hover:text-tertiary hover:bg-tertiary/10 transition-all"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-white/40 hover:text-error hover:bg-error/10 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {initialCategories.length === 0 && !showNew && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-white/40 font-mono text-xs uppercase"
                >
                  Nenhuma categoria criada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
