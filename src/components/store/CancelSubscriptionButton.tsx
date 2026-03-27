"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/subscriptions", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao cancelar");
      }
      router.refresh();
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-yellow-400 text-xs">
          <AlertTriangle size={14} />
          <span>Tens a certeza?</span>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Sim, Cancelar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-4 py-2 bg-white/5 text-white/50 text-xs font-bold uppercase tracking-widest hover:text-white/80 transition-colors"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-4 py-2 bg-white/5 text-red-400/80 text-xs font-bold uppercase tracking-widest border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all"
    >
      Cancelar Subscrição
    </button>
  );
}
