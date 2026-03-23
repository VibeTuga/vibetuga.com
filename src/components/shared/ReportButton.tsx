"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag, X, Loader2 } from "lucide-react";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Assédio" },
  { value: "inappropriate", label: "Conteúdo Impróprio" },
  { value: "copyright", label: "Direitos de Autor" },
  { value: "other", label: "Outro" },
] as const;

export function ReportButton({
  contentType,
  contentId,
  size = "md",
}: {
  contentType: "post" | "comment" | "project" | "product" | "review";
  contentId: string;
  size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Seleciona um motivo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao submeter denúncia.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setReason("");
        setDetails("");
      }, 2000);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-white/20 hover:text-error/80 transition-colors"
        title="Denunciar"
      >
        <Flag size={iconSize} />
        {size === "md" && (
          <span className="text-[10px] font-mono uppercase tracking-widest">Denunciar</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-surface-container-low border border-white/10 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-error" />
                <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-white">
                  Denunciar Conteúdo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-primary font-headline font-bold text-sm uppercase tracking-wider">
                  Denúncia Enviada
                </p>
                <p className="text-white/40 text-xs mt-2">A equipa irá analisar o teu pedido.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Reason radios */}
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-widest text-white/40 mb-3">
                    Motivo
                  </label>
                  <div className="space-y-2">
                    {REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                          reason === r.value
                            ? "bg-error/5 border-error/30 text-white"
                            : "bg-surface-container-lowest border-white/5 text-white/50 hover:border-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                            reason === r.value ? "border-error bg-error" : "border-white/20"
                          }`}
                        />
                        <span className="text-xs font-mono uppercase tracking-wider">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details textarea */}
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-widest text-white/40 mb-2">
                    Detalhes (opcional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-surface-container-lowest border border-white/5 focus:border-error/30 text-white text-sm p-3 font-body placeholder:text-white/20 resize-none transition-all outline-none"
                    placeholder="Descreve o problema..."
                  />
                </div>

                {error && <p className="text-error text-xs font-mono">{error}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="flex items-center gap-2 px-5 py-2 bg-error text-white font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(255,100,100,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Flag size={14} />
                    )}
                    Enviar Denúncia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
