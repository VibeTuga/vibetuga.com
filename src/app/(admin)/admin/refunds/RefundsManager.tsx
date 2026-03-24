"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, RotateCcw, MessageSquare } from "lucide-react";

interface Refund {
  id: string;
  purchaseId: string;
  buyerId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  stripeRefundId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  productTitle: string;
  productSlug: string;
  pricePaidCents: number;
  buyerName: string | null;
  buyerDisplayName: string | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-400" },
  approved: { label: "Aprovado", className: "bg-primary/10 text-primary" },
  rejected: { label: "Rejeitado", className: "bg-error/10 text-error" },
  refunded: { label: "Reembolsado", className: "bg-blue-500/10 text-blue-400" },
};

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "refunded";

export function RefundsManager() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  async function fetchRefunds() {
    try {
      const res = await fetch("/api/store/refunds");
      if (res.ok) {
        const data = await res.json();
        setRefunds(data.refunds);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/store/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: adminNotes.trim() || undefined }),
      });

      if (res.ok) {
        setNotesOpen(null);
        setAdminNotes("");
        await fetchRefunds();
        router.refresh();
      }
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === "all" ? refunds : refunds.filter((r) => r.status === filter);

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: "pending", label: "Pendentes" },
    { key: "all", label: "Todos" },
    { key: "approved", label: "Aprovados" },
    { key: "rejected", label: "Rejeitados" },
    { key: "refunded", label: "Reembolsados" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {filterTabs.map((tab) => {
          const count =
            tab.key === "all" ? refunds.length : refunds.filter((r) => r.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-white/40 border border-white/5 hover:text-white/60 hover:border-white/10"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 text-[8px] bg-white/5 rounded-full">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-white/5 bg-surface-container-lowest">
          <RotateCcw size={40} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">
            {filter === "all"
              ? "Nenhum pedido de reembolso."
              : `Nenhum reembolso ${filterTabs.find((t) => t.key === filter)?.label.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((refund) => {
            const statusInfo = STATUS_LABELS[refund.status] ?? STATUS_LABELS.pending;
            const buyerName = refund.buyerDisplayName ?? refund.buyerName ?? "Utilizador";

            return (
              <div
                key={refund.id}
                className="bg-surface-container-lowest border border-white/5 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{refund.productTitle}</span>
                      <span
                        className={`px-2 py-[2px] text-[9px] font-mono uppercase ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 mb-2">
                      <span>{formatPrice(refund.pricePaidCents)}</span>
                      <span>·</span>
                      <span>por {buyerName}</span>
                      <span>·</span>
                      <span>{formatDate(refund.createdAt)}</span>
                    </div>
                    <div className="bg-surface-container-low border border-white/5 p-3 text-xs text-white/60">
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block mb-1">
                        Motivo
                      </span>
                      {refund.reason}
                    </div>

                    {refund.adminNotes && (
                      <div className="bg-surface-container-low border border-primary/10 p-3 mt-2 text-xs text-white/60">
                        <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest block mb-1">
                          Notas do Admin
                        </span>
                        {refund.adminNotes}
                      </div>
                    )}

                    {refund.stripeRefundId && (
                      <div className="mt-2 text-[9px] font-mono text-white/20">
                        Stripe: {refund.stripeRefundId}
                      </div>
                    )}

                    {/* Admin notes input */}
                    {notesOpen === refund.id && refund.status === "pending" && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Notas do admin (opcional)..."
                          rows={2}
                          className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(refund.id, "approved")}
                            disabled={actionLoading === refund.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === refund.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Aprovar e Reembolsar
                          </button>
                          <button
                            onClick={() => handleAction(refund.id, "rejected")}
                            disabled={actionLoading === refund.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error text-[10px] font-mono uppercase tracking-wider hover:bg-error/20 transition-colors disabled:opacity-50"
                          >
                            <X size={12} />
                            Rejeitar
                          </button>
                          <button
                            onClick={() => {
                              setNotesOpen(null);
                              setAdminNotes("");
                            }}
                            className="px-3 py-1.5 text-[10px] font-mono text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {refund.status === "pending" && notesOpen !== refund.id && (
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNotesOpen(refund.id);
                          setAdminNotes("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/50 text-[10px] font-mono uppercase tracking-wider hover:bg-white/10 hover:text-white/70 transition-colors"
                      >
                        <MessageSquare size={12} />
                        Responder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
