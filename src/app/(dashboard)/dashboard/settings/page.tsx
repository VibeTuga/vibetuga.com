"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Bell, BellOff, Globe, Languages, Loader2, Check } from "lucide-react";

interface UserSettingsData {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  privacyLevel: "public" | "members" | "private";
  locale: "pt" | "en";
}

const PRIVACY_OPTIONS = [
  {
    value: "public" as const,
    label: "Público",
    description: "Qualquer pessoa pode ver o teu perfil",
  },
  { value: "members" as const, label: "Membros", description: "Apenas membros registados" },
  { value: "private" as const, label: "Privado", description: "Apenas tu podes ver o teu perfil" },
];

const LOCALE_OPTIONS = [
  { value: "pt" as const, label: "Português" },
  { value: "en" as const, label: "English" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar definições");
        return res.json();
      })
      .then((data: UserSettingsData) => setSettings(data))
      .catch(() => setError("Não foi possível carregar as definições."))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (updates: Partial<UserSettingsData>) => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/users/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao guardar");
      }

      const updated: UserSettingsData = await res.json();
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar definições");
    } finally {
      setSaving(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Settings size={20} className="text-primary" />
          Definições
        </h1>
        <p className="text-sm text-white/40 mt-1">Gere as tuas preferências e privacidade.</p>
      </div>

      {/* Status bar */}
      {(saving || saved || error) && (
        <div
          className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded ${
            error
              ? "bg-red-500/10 text-red-400"
              : saved
                ? "bg-primary/10 text-primary"
                : "bg-surface-container text-white/50"
          }`}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {saved && <Check size={12} />}
          {saving ? "A guardar..." : saved ? "Guardado" : error}
        </div>
      )}

      {/* Notifications */}
      <section className="bg-surface-container-low rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Bell size={14} className="text-primary" />
          Notificações
        </h2>

        <ToggleRow
          label="Notificações por email"
          description="Receber emails sobre atividade na plataforma"
          checked={settings.emailNotifications}
          disabled={saving}
          icon={settings.emailNotifications ? <Bell size={16} /> : <BellOff size={16} />}
          onChange={(val) => {
            setSettings({ ...settings, emailNotifications: val });
            save({ emailNotifications: val });
          }}
        />

        <ToggleRow
          label="Notificações in-app"
          description="Receber notificações dentro da plataforma"
          checked={settings.inAppNotifications}
          disabled={saving}
          icon={settings.inAppNotifications ? <Bell size={16} /> : <BellOff size={16} />}
          onChange={(val) => {
            setSettings({ ...settings, inAppNotifications: val });
            save({ inAppNotifications: val });
          }}
        />
      </section>

      {/* Privacy */}
      <section className="bg-surface-container-low rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Globe size={14} className="text-tertiary" />
          Privacidade
        </h2>

        <div>
          <label className="block text-sm text-white/80 mb-2">Visibilidade do perfil</label>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={saving}
                onClick={() => {
                  if (opt.value === settings.privacyLevel) return;
                  setSettings({ ...settings, privacyLevel: opt.value });
                  save({ privacyLevel: opt.value });
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  settings.privacyLevel === opt.value
                    ? "bg-primary/10 border-primary/30 text-white"
                    : "bg-surface-container border-white/5 text-white/60 hover:border-white/10"
                } disabled:opacity-50`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <p className="text-[11px] text-white/40 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Locale */}
      <section className="bg-surface-container-low rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Languages size={14} className="text-secondary" />
          Idioma
        </h2>

        <div>
          <label className="block text-sm text-white/80 mb-2">Idioma da interface</label>
          <div className="flex gap-2">
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={saving}
                onClick={() => {
                  if (opt.value === settings.locale) return;
                  setSettings({ ...settings, locale: opt.value });
                  save({ locale: opt.value });
                }}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-mono transition-colors ${
                  settings.locale === opt.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface-container border-white/5 text-white/50 hover:border-white/10"
                } disabled:opacity-50`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Toggle Row ─────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  icon,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-white/30">{icon}</div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-[11px] text-white/40">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-primary/80" : "bg-surface-container-highest"
        } disabled:opacity-50`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
