"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Calendar, X } from "lucide-react";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startAt: string;
  endAt: string | null;
  link: string | null;
  coverImage: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  creatorDisplayName: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  stream: "Stream",
  workshop: "Workshop",
  challenge: "Desafio",
  meetup: "Meetup",
  other: "Outro",
};

const TYPE_COLORS: Record<string, string> = {
  stream: "bg-purple-500/20 text-purple-400",
  workshop: "bg-blue-500/20 text-blue-400",
  challenge: "bg-yellow-500/20 text-yellow-400",
  meetup: "bg-green-500/20 text-green-400",
  other: "bg-white/10 text-white/50",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  eventType: "stream",
  startAt: "",
  endAt: "",
  link: "",
  coverImage: "",
};

export function EventsManager({ initialEvents }: { initialEvents: EventRow[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(event: EventRow) {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description ?? "",
      eventType: event.eventType,
      startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : "",
      endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "",
      link: event.link ?? "",
      coverImage: event.coverImage ?? "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.startAt) return;

    setSaving(true);
    setError("");

    try {
      const url = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          eventType: formData.eventType,
          startAt: formData.startAt,
          endAt: formData.endAt || undefined,
          link: formData.link || undefined,
          coverImage: formData.coverImage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao guardar evento.");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tens a certeza que queres eliminar este evento?")) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-headline font-bold text-white">Gestão de Eventos</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-mono uppercase font-bold hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-container border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest">
              {editingId ? "Editar Evento" : "Novo Evento"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-white/30 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <p className="text-error text-xs font-mono mb-4 p-3 bg-error/10 border border-error/20 rounded">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                  required
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  placeholder="Nome do evento"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white focus:border-primary/50 focus:outline-none"
                >
                  <option value="stream">Stream</option>
                  <option value="workshop">Workshop</option>
                  <option value="challenge">Desafio</option>
                  <option value="meetup">Meetup</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none resize-none"
                placeholder="Descrição do evento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Início *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Fim
                </label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                  Imagem de Capa
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-high border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-xs font-mono uppercase text-white/40 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-on-primary text-xs font-mono uppercase font-bold hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all disabled:opacity-50"
              >
                {saving ? "A guardar..." : editingId ? "Guardar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events table */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 font-mono text-sm">Nenhum evento criado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4">
                  Título
                </th>
                <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4">
                  Tipo
                </th>
                <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4">
                  Data
                </th>
                <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4">
                  Criador
                </th>
                <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-white/5 hover:bg-surface-container-high/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-sm text-white font-medium">{event.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-full ${TYPE_COLORS[event.eventType] ?? TYPE_COLORS.other}`}
                    >
                      {TYPE_LABELS[event.eventType] ?? event.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-white/40">
                    {new Date(event.startAt).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 text-xs text-white/40">
                    {event.creatorDisplayName ?? event.creatorName ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="p-1.5 text-white/30 hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 text-white/30 hover:text-error transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
