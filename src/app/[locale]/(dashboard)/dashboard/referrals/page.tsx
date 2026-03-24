"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, Zap, Link2, Loader2, UserPlus } from "lucide-react";

interface ReferralStats {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  completedCount: number;
  totalXpEarned: number;
  referrals: {
    id: string;
    status: string;
    xpAwarded: number;
    createdAt: string;
    completedAt: string | null;
  }[];
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function generateLink() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      if (res.ok) {
        await fetchStats();
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink() {
    if (!stats?.referralLink) return;
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: noop
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-headline font-bold text-white uppercase tracking-tight">
          Referências
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Convida amigos para a VibeTuga e ganha XP por cada registo.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
            <Users size={16} />
            <span className="text-lg font-mono font-bold">{stats?.totalReferrals ?? 0}</span>
          </div>
          <p className="text-[10px] font-mono text-white/30 uppercase">Total</p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-secondary mb-1">
            <UserPlus size={16} />
            <span className="text-lg font-mono font-bold">{stats?.completedCount ?? 0}</span>
          </div>
          <p className="text-[10px] font-mono text-white/30 uppercase">Completadas</p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-tertiary mb-1">
            <Zap size={16} />
            <span className="text-lg font-mono font-bold">{stats?.totalXpEarned ?? 0}</span>
          </div>
          <p className="text-[10px] font-mono text-white/30 uppercase">XP Ganho</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-surface-container-low rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Link2 size={14} className="text-primary" />O Teu Link de Referência
        </h2>

        {stats?.referralLink ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-container-lowest border border-white/5 px-4 py-2.5 text-sm font-mono text-white/70 truncate rounded-sm">
              {stats.referralLink}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all rounded-sm"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        ) : (
          <button
            onClick={generateLink}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 rounded-sm"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
            Gerar Link
          </button>
        )}

        <p className="text-xs text-white/30">
          Partilha este link com amigos. Quando se registarem, ganhas{" "}
          <span className="text-primary font-semibold">+25 XP</span> por cada referência.
        </p>
      </div>

      {/* Referral history */}
      {stats && stats.referrals.length > 0 && (
        <div>
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users size={14} className="text-secondary" />
            Histórico
          </h2>
          <div className="bg-surface-container-low rounded-lg divide-y divide-white/5">
            {stats.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 uppercase ${
                      ref.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : ref.status === "expired"
                          ? "bg-white/5 text-white/30"
                          : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {ref.status === "completed"
                      ? "Completada"
                      : ref.status === "expired"
                        ? "Expirada"
                        : "Pendente"}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {new Date(ref.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                {ref.xpAwarded > 0 && (
                  <span className="text-xs font-mono text-primary">+{ref.xpAwarded} XP</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
