"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, CheckCircle, AlertCircle } from "lucide-react";

type ProfileData = {
  displayName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  email: string | null;
  discordUsername: string;
  image: string | null;
  role: string;
  xpPoints: number;
  level: number;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderador",
  author: "Autor",
  seller: "Seller",
  member: "Membro",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar perfil");
        return r.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setDisplayName(data.displayName ?? "");
        setBio(data.bio ?? "");
        setWebsiteUrl(data.websiteUrl ?? "");
      })
      .catch(() => setError("Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          websiteUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao guardar perfil.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao guardar perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <p className="text-white/50 text-sm">{error || "Perfil não encontrado."}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Meu Perfil
        </h1>
        <p className="text-white/40 text-sm">Edita as tuas informações de perfil.</p>
      </header>

      {/* Read-only info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low border border-white/5 p-4">
          <span className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
            Discord
          </span>
          <span className="text-sm text-white">{profile.discordUsername}</span>
        </div>
        <div className="bg-surface-container-low border border-white/5 p-4">
          <span className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
            Email
          </span>
          <span className="text-sm text-white/70">{profile.email ?? "—"}</span>
        </div>
        <div className="bg-surface-container-low border border-white/5 p-4">
          <span className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
            Role
          </span>
          <span className="text-sm text-primary font-mono">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>
        <div className="bg-surface-container-low border border-white/5 p-4">
          <span className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
            XP / Level
          </span>
          <span className="text-sm text-tertiary font-mono">
            {profile.xpPoints.toLocaleString("pt-PT")} XP — Nv. {profile.level}
          </span>
        </div>
      </div>

      {/* Editable form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Nome de Exibição
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="O teu nome público"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-none transition-all outline-none"
            placeholder="Fala sobre ti..."
          />
          <p className="mt-1 text-[10px] font-mono text-white/20 text-right">{bio.length}/500</p>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Website
          </label>
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            maxLength={200}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
            placeholder="https://exemplo.com"
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-error text-xs font-mono">
            <AlertCircle size={14} />
            {error}
          </p>
        )}

        {success && (
          <p className="flex items-center gap-2 text-primary text-xs font-mono">
            <CheckCircle size={14} />
            Perfil atualizado!
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Perfil
        </button>
      </form>
    </div>
  );
}
