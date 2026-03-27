"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Video } from "lucide-react";

interface StreamRow {
  id: string;
  platform: "twitch" | "youtube";
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number | null;
  vodUrl: string | null;
  thumbnailUrl: string | null;
  isLive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  creatorDisplayName: string | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitch: "bg-purple-500/20 text-purple-400",
  youtube: "bg-red-500/20 text-red-400",
};

const EMPTY_FORM = {
  platform: "twitch" as "twitch" | "youtube",
  title: "",
  description: "",
  scheduledAt: "",
  duration: "",
  vodUrl: "",
  thumbnailUrl: "",
  isLive: false,
};

export function StreamsManager({ initialStreams }: { initialStreams: StreamRow[] }) {
  const router = useRouter();
  const [streams, setStreams] = useState(initialStreams);
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

  function openEdit(stream: StreamRow) {
    setEditingId(stream.id);
    setFormData({
      platform: stream.platform,
      title: stream.title,
      description: stream.description ?? "",
      scheduledAt: stream.scheduledAt
        ? new Date(stream.scheduledAt).toISOString().slice(0, 16)
        : "",
      duration: stream.duration?.toString() ?? "",
      vodUrl: stream.vodUrl ?? "",
      thumbnailUrl: stream.thumbnailUrl ?? "",
      isLive: stream.isLive,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      platform: formData.platform,
      title: formData.title,
      description: formData.description || undefined,
      scheduledAt: formData.scheduledAt,
      duration: formData.duration ? Number(formData.duration) : undefined,
      vodUrl: formData.vodUrl || undefined,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      isLive: formData.isLive,
    };

    try {
      const url = editingId ? `/api/streams/${editingId}` : "/api/streams";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao guardar");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      router.refresh();

      // Refetch for instant update
      const listRes = await fetch("/api/streams");
      if (listRes.ok) {
        const listData = await listRes.json();
        setStreams(
          [...listData.upcoming, ...listData.past].sort(
            (a: StreamRow, b: StreamRow) =>
              new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tens a certeza que queres eliminar esta stream?")) return;

    try {
      const res = await fetch(`/api/streams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao eliminar");

      setStreams((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      setError("Erro ao eliminar stream");
    }
  }

  async function toggleLive(stream: StreamRow) {
    try {
      const res = await fetch(`/api/streams/${stream.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: !stream.isLive }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");

      setStreams((prev) => prev.map((s) => (s.id === stream.id ? { ...s, isLive: !s.isLive } : s)));
      router.refresh();
    } catch {
      setError("Erro ao atualizar estado da stream");
    }
  }

  const now = new Date();
  const liveStreams = streams.filter((s) => s.isLive);
  const upcomingStreams = streams.filter((s) => !s.isLive && new Date(s.scheduledAt) > now);
  const pastStreams = streams.filter((s) => !s.isLive && new Date(s.scheduledAt) <= now);

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white flex items-center gap-3">
            <Video size={24} className="text-primary" />
            Gerir Streams
          </h1>
          <p className="text-white/40 text-sm mt-1">Agenda e gere streams no Twitch e YouTube</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          <Plus size={16} />
          Nova Stream
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-surface-container-low border border-primary/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-white">
              {editingId ? "Editar Stream" : "Nova Stream"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                  Plataforma
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value as "twitch" | "youtube" })
                  }
                  className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
                >
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                  Data & Hora
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                  className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 uppercase mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={300}
                placeholder="Ex: Live Coding — Construindo um Agente AI"
                className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descrição da stream (opcional)"
                className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Ex: 120"
                  min={1}
                  className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                  URL do VOD
                </label>
                <input
                  type="url"
                  value={formData.vodUrl}
                  onChange={(e) => setFormData({ ...formData, vodUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface-container border border-white/10 text-white px-3 py-2 text-sm rounded focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLive}
                  onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-red-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm text-white/60">Ao Vivo</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
              >
                {saving ? "A guardar..." : editingId ? "Atualizar" : "Criar Stream"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stream sections */}
      {streams.length === 0 && !showForm && (
        <div className="text-center py-20">
          <Video size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 font-mono text-sm">Nenhuma stream registada.</p>
        </div>
      )}

      {/* Live */}
      {liveStreams.length > 0 && (
        <StreamSection
          title="Ao Vivo"
          streams={liveStreams}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleLive={toggleLive}
          titleClass="text-red-400"
        />
      )}

      {/* Upcoming */}
      {upcomingStreams.length > 0 && (
        <StreamSection
          title="Próximas"
          streams={upcomingStreams}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleLive={toggleLive}
          titleClass="text-primary/80"
        />
      )}

      {/* Past */}
      {pastStreams.length > 0 && (
        <StreamSection
          title="Anteriores"
          streams={pastStreams}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleLive={toggleLive}
          titleClass="text-white/30"
        />
      )}
    </div>
  );
}

function StreamSection({
  title,
  streams,
  onEdit,
  onDelete,
  onToggleLive,
  titleClass,
}: {
  title: string;
  streams: StreamRow[];
  onEdit: (s: StreamRow) => void;
  onDelete: (id: string) => void;
  onToggleLive: (s: StreamRow) => void;
  titleClass: string;
}) {
  return (
    <section className="mb-8">
      <h2 className={`text-xs font-mono uppercase tracking-widest mb-4 ${titleClass}`}>{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">
                Plataforma
              </th>
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">Título</th>
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">Data</th>
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">Estado</th>
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">VOD</th>
              <th className="py-3 px-3 font-mono text-[10px] uppercase text-white/30">Ações</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((stream) => (
              <tr
                key={stream.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded-full ${PLATFORM_COLORS[stream.platform]}`}
                  >
                    {PLATFORM_LABELS[stream.platform]}
                  </span>
                </td>
                <td className="py-3 px-3 text-white/80 font-medium max-w-[300px] truncate">
                  {stream.title}
                </td>
                <td className="py-3 px-3 text-white/40 font-mono text-xs">
                  {new Date(stream.scheduledAt).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => onToggleLive(stream)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase rounded-full cursor-pointer transition-colors ${
                      stream.isLive
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {stream.isLive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                      </span>
                    )}
                    {stream.isLive ? "AO VIVO" : "Offline"}
                  </button>
                </td>
                <td className="py-3 px-3 text-white/40 text-xs">
                  {stream.vodUrl ? (
                    <a
                      href={stream.vodUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver VOD
                    </a>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(stream)}
                      className="text-white/30 hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(stream.id)}
                      className="text-white/30 hover:text-red-400 transition-colors"
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
    </section>
  );
}
