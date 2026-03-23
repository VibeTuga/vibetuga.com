"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Users, Crown } from "lucide-react";

interface ChallengeRow {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  xpReward: number;
  badgeRewardId: string | null;
  status: string;
  createdAt: string;
  entryCount: number;
}

interface BadgeOption {
  id: string;
  name: string;
  icon: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  voting: "Votação",
  completed: "Concluído",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-white/5 text-white/30",
  active: "bg-green-500/20 text-green-400",
  voting: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-white/10 text-white/50",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["active"],
  active: ["voting", "completed"],
  voting: ["completed"],
  completed: [],
};

export function ChallengesManager({
  initialChallenges,
  badges,
}: {
  initialChallenges: ChallengeRow[];
  badges: BadgeOption[];
}) {
  const router = useRouter();
  const [challengeList, setChallengeList] = useState(initialChallenges);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    xpReward: "200",
    badgeRewardId: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.startAt || !formData.endAt) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startAt: formData.startAt,
          endAt: formData.endAt,
          xpReward: parseInt(formData.xpReward, 10) || 0,
          badgeRewardId: formData.badgeRewardId || null,
          status: "draft",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar desafio.");
        return;
      }

      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        startAt: "",
        endAt: "",
        xpReward: "200",
        badgeRewardId: "",
      });
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setChallengeList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
        );
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  async function markWinner(challengeId: number, entryId: number) {
    try {
      await fetch(`/api/challenges/${challengeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: String(entryId) }),
      });
      router.refresh();
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-8">
      {/* Create button */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          <Plus size={16} />
          Novo Desafio
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <form
          onSubmit={createChallenge}
          className="bg-surface-container-lowest border border-white/5 rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-mono text-white/40 mb-1.5">Título *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 mb-1.5">
              Descrição * (Markdown)
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white font-mono focus:outline-none focus:border-primary/40 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1.5">Data Início *</label>
              <input
                type="datetime-local"
                required
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1.5">Data Fim *</label>
              <input
                type="datetime-local"
                required
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1.5">XP Recompensa</label>
              <input
                type="number"
                min={0}
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1.5">
                Badge Recompensa
              </label>
              <select
                value={formData.badgeRewardId}
                onChange={(e) => setFormData({ ...formData, badgeRewardId: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white focus:outline-none focus:border-primary/40"
              >
                <option value="">Nenhuma</option>
                {badges.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon ?? "🏅"} {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
            >
              {creating ? "A criar..." : "Criar Desafio"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-white/5 text-white/40 text-sm hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Challenges list */}
      <div className="space-y-4">
        {challengeList.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm font-mono">Nenhum desafio criado.</p>
          </div>
        ) : (
          challengeList.map((c) => {
            const transitions = VALID_TRANSITIONS[c.status] ?? [];
            return (
              <div
                key={c.id}
                className="bg-surface-container-lowest border border-white/5 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-full ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                      <span className="text-[11px] font-mono text-white/20">#{c.id}</span>
                    </div>
                    <Link
                      href={`/challenges/${c.id}`}
                      className="text-lg font-headline font-semibold text-white hover:text-primary transition-colors"
                    >
                      {c.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-xs font-mono text-white/25">
                      <span>
                        {new Date(c.startAt).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        –{" "}
                        {new Date(c.endAt).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {c.entryCount}
                      </span>
                      {c.xpReward > 0 && <span>+{c.xpReward} XP</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {transitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => updateStatus(c.id, nextStatus)}
                        className="px-3 py-1.5 text-[11px] font-mono uppercase bg-white/5 text-white/40 hover:bg-white/10 hover:text-white rounded transition-all"
                      >
                        → {STATUS_LABELS[nextStatus]}
                      </button>
                    ))}
                    {(c.status === "voting" || c.status === "completed") && (
                      <ChallengeEntriesPreview
                        challengeId={c.id}
                        onMarkWinner={markWinner}
                        canMark={c.status === "voting" || c.status === "completed"}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ChallengeEntriesPreview({
  challengeId,
  onMarkWinner,
  canMark,
}: {
  challengeId: number;
  onMarkWinner: (challengeId: number, entryId: number) => void;
  canMark: boolean;
}) {
  const [entries, setEntries] = useState<
    {
      id: number;
      userId: string;
      userDisplayName: string | null;
      votesCount: number;
      status: string;
    }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadEntries() {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(
          (data.entries ?? []).map(
            (e: {
              id: number;
              userId: string;
              userDisplayName: string | null;
              votesCount: number;
              status: string;
              userDiscordUsername: string;
            }) => ({
              id: e.id,
              userId: e.userId,
              userDisplayName: e.userDisplayName ?? e.userDiscordUsername,
              votesCount: e.votesCount,
              status: e.status,
            }),
          ),
        );
        setLoaded(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={loadEntries}
        disabled={loading}
        className="px-3 py-1.5 text-[11px] font-mono uppercase bg-yellow-500/10 text-yellow-400/70 hover:bg-yellow-500/20 rounded transition-all"
      >
        {loading ? "..." : loaded ? "Entradas" : "Ver Entradas"}
      </button>

      {loaded && entries.length > 0 && (
        <div className="mt-2 space-y-1">
          {entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-white/40">{entry.userDisplayName}</span>
              <span className="text-white/20">({entry.votesCount} votos)</span>
              {entry.status === "winner" ? (
                <span className="text-yellow-400 flex items-center gap-0.5">
                  <Crown size={10} /> Vencedor
                </span>
              ) : canMark ? (
                <button
                  onClick={() => onMarkWinner(challengeId, entry.id)}
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  Marcar vencedor
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
