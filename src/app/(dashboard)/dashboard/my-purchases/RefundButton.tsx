"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2, X } from "lucide-react";

interface RefundInfo {
  id: string;
  purchaseId: string;
  status: string;
  reason: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-400" },
  approved: { label: "Aprovado", className: "bg-primary/10 text-primary" },
  rejected: { label: "Rejeitado", className: "bg-error/10 text-error" },
  refunded: { label: "Reembolsado", className: "bg-blue-500/10 text-blue-400" },
};

export function RefundButton({
  purchaseId,
  purchaseDate,
  refund,
}: {
  purchaseId: string;
  purchaseDate: string;
  refund?: RefundInfo;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const daysSince = Math.floor(
    (Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  const canRefund = daysSince <= 14 && !refund;

  // Show refund status if a refund exists
  if (refund) {
    const statusInfo = STATUS_LABELS[refund.status] ?? STATUS_LABELS.pending;
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-[2px] text-[9px] font-mono uppercase ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>
    );
  }

  if (!canRefund) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/store/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao pedir reembolso.");
        return;
      }

      setShowForm(false);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  if (showForm) {
    return (
      <div className="mt-3 bg-surface-container-low border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            Pedir Reembolso
          </span>
          <button
            onClick={() => setShowForm(false)}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreve o motivo do reembolso (mín. 10 caracteres)..."
            required
            minLength={10}
            rows={3}
            className="w-full bg-surface-container-lowest border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none resize-none"
          />
          {error && <p className="text-error text-xs font-mono mt-2">{error}</p>}
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-[10px] font-mono text-white/40 uppercase tracking-wider hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 10}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error text-[10px] font-mono uppercase tracking-wider hover:bg-error/20 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
              Confirmar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/50 text-[10px] font-mono uppercase tracking-wider hover:bg-white/10 hover:text-white/70 transition-colors"
    >
      <RotateCcw size={12} />
      Pedir Reembolso
    </button>
  );
}
