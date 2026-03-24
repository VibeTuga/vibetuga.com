"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Bell,
  BellOff,
  Globe,
  Languages,
  Loader2,
  Check,
  Download,
  Trash2,
  Shield,
  AlertTriangle,
} from "lucide-react";

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

interface RoleRequestData {
  id: string;
  requestedRole: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
}

interface UserProfile {
  role: string;
  discordUsername: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account section state
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);

  // Role request state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [roleRequests, setRoleRequests] = useState<RoleRequestData[]>([]);
  const [roleRequestForm, setRoleRequestForm] = useState({ requestedRole: "seller", reason: "" });
  const [submittingRole, setSubmittingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/users/me/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar definições");
        return res.json();
      })
      .then((data: UserSettingsData) => setSettings(data))
      .catch(() => setError("Não foi possível carregar as definições."))
      .finally(() => setLoading(false));

    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data: UserProfile) => setUserProfile(data))
      .catch(() => {});

    fetch("/api/users/me/role-request")
      .then((res) => res.json())
      .then((data: RoleRequestData[]) => {
        if (Array.isArray(data)) setRoleRequests(data);
      })
      .catch(() => {});
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

      {/* Role Upgrade Request */}
      {userProfile?.role === "member" && (
        <section className="bg-surface-container-low rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-tertiary" />
            Pedir Upgrade de Role
          </h2>

          {roleRequests.some((r) => r.status === "pending") ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                Tens um pedido pendente. Aguarda a revisão por um administrador.
              </p>
              {roleRequests
                .filter((r) => r.status === "pending")
                .map((r) => (
                  <div key={r.id} className="mt-3 text-xs text-white/40 font-mono">
                    <span className="text-white/60">Role pedido:</span>{" "}
                    <span className="text-primary">{r.requestedRole}</span>
                    <span className="ml-4 text-white/60">Submetido:</span>{" "}
                    {new Date(r.createdAt).toLocaleDateString("pt-PT")}
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Role pretendido</label>
                <div className="flex gap-2">
                  {(["seller", "author"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setRoleRequestForm({ ...roleRequestForm, requestedRole: role })
                      }
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-mono transition-colors ${
                        roleRequestForm.requestedRole === role
                          ? "bg-tertiary/10 border-tertiary/30 text-tertiary"
                          : "bg-surface-container border-white/5 text-white/50 hover:border-white/10"
                      }`}
                    >
                      {role === "seller" ? "Seller" : "Author"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Razão do pedido <span className="text-white/30">(mín. 10 caracteres)</span>
                </label>
                <textarea
                  value={roleRequestForm.reason}
                  onChange={(e) =>
                    setRoleRequestForm({ ...roleRequestForm, reason: e.target.value })
                  }
                  rows={3}
                  maxLength={1000}
                  placeholder="Explica porque queres este role..."
                  className="w-full bg-surface-container border border-white/5 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/30"
                />
              </div>

              {roleError && <p className="text-xs text-red-400">{roleError}</p>}
              {roleSuccess && <p className="text-xs text-primary">Pedido submetido com sucesso!</p>}

              <button
                type="button"
                disabled={submittingRole || roleRequestForm.reason.trim().length < 10}
                onClick={async () => {
                  setSubmittingRole(true);
                  setRoleError(null);
                  setRoleSuccess(false);
                  try {
                    const res = await fetch("/api/users/me/role-request", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(roleRequestForm),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error ?? "Erro ao submeter");
                    }
                    const newReq: RoleRequestData = await res.json();
                    setRoleRequests([newReq, ...roleRequests]);
                    setRoleSuccess(true);
                    setRoleRequestForm({ requestedRole: "seller", reason: "" });
                  } catch (err) {
                    setRoleError(err instanceof Error ? err.message : "Erro ao submeter pedido");
                  } finally {
                    setSubmittingRole(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-tertiary/10 border border-tertiary/20 text-tertiary text-sm font-mono rounded-lg hover:bg-tertiary/20 transition-colors disabled:opacity-50"
              >
                {submittingRole ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Shield size={14} />
                )}
                Submeter Pedido
              </button>
            </div>
          )}

          {/* Show past requests */}
          {roleRequests.filter((r) => r.status !== "pending").length > 0 && (
            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
                Histórico
              </p>
              {roleRequests
                .filter((r) => r.status !== "pending")
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 text-xs font-mono text-white/40"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        r.status === "approved"
                          ? "bg-primary/10 text-primary"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {r.status === "approved" ? "Aprovado" : "Rejeitado"}
                    </span>
                    <span className="text-white/60">{r.requestedRole}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString("pt-PT")}</span>
                    {r.reviewNote && <span className="text-white/30">— {r.reviewNote}</span>}
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* Conta — Data Export & Deletion */}
      <section className="bg-surface-container-low rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Download size={14} className="text-primary" />
          Conta
        </h2>

        {accountError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-400">{accountError}</p>
          </div>
        )}

        {/* Data Export */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/80">Exportar Dados</p>
            <p className="text-[11px] text-white/40">
              Faz download de todos os teus dados em formato JSON (GDPR).
            </p>
          </div>
          <button
            type="button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              setAccountError(null);
              try {
                const res = await fetch("/api/users/me/export");
                if (!res.ok) {
                  const data = await res.json();
                  throw new Error(data.error ?? "Erro ao exportar");
                }
                const blob = await res.blob();
                const disposition = res.headers.get("content-disposition");
                const filenameMatch = disposition?.match(/filename="(.+)"/);
                const filename = filenameMatch?.[1] ?? "vibetuga-export.json";
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                setAccountError(err instanceof Error ? err.message : "Erro ao exportar dados");
              } finally {
                setExporting(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-mono rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Exportar
          </button>
        </div>

        {/* Danger Zone — Delete Account */}
        <div className="pt-4 border-t border-red-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium">Zona de Perigo</p>
              <p className="text-[11px] text-white/40 mt-1">
                Eliminar a tua conta é permanente e irreversível. Todos os teus dados, posts,
                comentários, projetos e compras serão apagados.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar Conta
                </button>
              ) : (
                <div className="mt-3 space-y-3 bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                  <p className="text-xs text-red-400">
                    Escreve{" "}
                    <span className="font-mono font-bold">
                      {userProfile?.discordUsername ?? "o teu username"}
                    </span>{" "}
                    para confirmar:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Escreve o teu username..."
                    className="w-full bg-surface-container border border-red-500/20 rounded-lg p-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        deleting || deleteConfirmText !== (userProfile?.discordUsername ?? "")
                      }
                      onClick={async () => {
                        setDeleting(true);
                        setAccountError(null);
                        try {
                          const res = await fetch("/api/users/me", { method: "DELETE" });
                          if (!res.ok) {
                            const data = await res.json();
                            throw new Error(data.error ?? "Erro ao eliminar");
                          }
                          window.location.href = "/login";
                        } catch (err) {
                          setAccountError(
                            err instanceof Error ? err.message : "Erro ao eliminar conta",
                          );
                          setDeleting(false);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-mono rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Confirmar Eliminação
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      className="px-4 py-2 bg-surface-container border border-white/5 text-white/50 text-sm font-mono rounded-lg hover:border-white/10 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
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
