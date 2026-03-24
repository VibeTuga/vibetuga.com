"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, X } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FlagForm {
  key: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
}

const emptyForm: FlagForm = {
  key: "",
  description: "",
  isEnabled: false,
  rolloutPercentage: 100,
};

export function FeatureFlagsManager({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<FlagForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function handleToggle(flag: FeatureFlag) {
    const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEnabled: !flag.isEnabled }),
    });
    if (res.ok) router.refresh();
  }

  async function handleRolloutChange(flag: FeatureFlag, value: number) {
    const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rolloutPercentage: value }),
    });
    if (res.ok) router.refresh();
  }

  async function handleCreate() {
    if (!form.key.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: form.key,
          description: form.description || null,
          isEnabled: form.isEnabled,
          rolloutPercentage: form.rolloutPercentage,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao criar flag");
        return;
      }
      setShowNew(false);
      setForm(emptyForm);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(flag: FeatureFlag) {
    if (!confirm(`Eliminar flag "${flag.key}"?`)) return;
    const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Erro ao eliminar flag");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowNew(true);
            setForm(emptyForm);
          }}
          disabled={showNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          Nova Flag
        </button>
      </div>

      <div className="bg-surface-container-low overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Chave
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Estado
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Rollout
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Descrição
              </th>
              <th className="text-right px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {showNew && (
              <tr className="border-b border-white/[0.03] bg-surface-container">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
                    className="w-full bg-surface-container-lowest border border-white/10 px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none"
                    placeholder="nova_feature"
                  />
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        isEnabled: !prev.isEnabled,
                      }))
                    }
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      form.isEnabled ? "bg-primary" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        form.isEnabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.rolloutPercentage}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          rolloutPercentage: parseInt(e.target.value),
                        }))
                      }
                      className="w-20 accent-primary"
                    />
                    <span className="text-[10px] font-mono text-white/60 w-8 text-right">
                      {form.rolloutPercentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full bg-surface-container-lowest border border-white/10 px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none"
                    placeholder="Descrição opcional"
                  />
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCreate}
                      disabled={saving || !form.key.trim()}
                      className="p-2 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                      title="Criar"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setShowNew(false);
                        setForm(emptyForm);
                      }}
                      className="p-2 text-white/40 hover:text-error hover:bg-error/10 transition-all"
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {initialFlags.map((flag) => (
              <FeatureFlagRow
                key={flag.id}
                flag={flag}
                onToggle={handleToggle}
                onRolloutChange={handleRolloutChange}
                onDelete={handleDelete}
              />
            ))}
            {initialFlags.length === 0 && !showNew && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-white/40 font-mono text-xs uppercase"
                >
                  Nenhuma feature flag criada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureFlagRow({
  flag,
  onToggle,
  onRolloutChange,
  onDelete,
}: {
  flag: FeatureFlag;
  onToggle: (flag: FeatureFlag) => void;
  onRolloutChange: (flag: FeatureFlag, value: number) => void;
  onDelete: (flag: FeatureFlag) => void;
}) {
  const [rollout, setRollout] = useState(flag.rolloutPercentage);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSliderChange(value: number) {
    setRollout(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      onRolloutChange(flag, value);
    }, 500);
    setDebounceTimer(timer);
  }

  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <td className="px-6 py-4">
        <span className="text-sm text-primary font-mono">{flag.key}</span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggle(flag)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            flag.isEnabled ? "bg-primary" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              flag.isEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={rollout}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="w-20 accent-primary"
          />
          <span className="text-[10px] font-mono text-white/60 w-8 text-right">{rollout}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-white/60">{flag.description || "—"}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end">
          <button
            onClick={() => onDelete(flag)}
            className="p-2 text-white/40 hover:text-error hover:bg-error/10 transition-all"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
