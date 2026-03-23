"use client";

import { useState, useEffect } from "react";
import { Flag, X, Loader2 } from "lucide-react";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Assédio" },
  { value: "inappropriate", label: "Conteúdo Inapropriado" },
  { value: "copyright", label: "Direitos de Autor" },
  { value: "other", label: "Outro" },
] as const;

type ReportButtonProps = {
  contentType: string;
  contentId: string;
  size?: "sm" | "md";
};

export function ReportButton({ contentType, contentId, size = "md" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setReason("");
        setDetails("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Seleciona uma razão.");
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

      if (res.status === 401) {
        setError("Precisas de fazer login para denunciar.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao submeter denúncia.");
        return;
      }

      setSuccess(true);
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
        className={`flex items-center gap-1.5 text-white/30 hover:text-error transition-colors ${
          size === "sm"
            ? "text-[10px] font-mono uppercase tracking-widest"
            : "text-xs font-mono uppercase tracking-widest"
        }`}
        title="Denunciar"
      >
        <Flag size={iconSize} />
        {size === "md" && <span>Denunciar</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md mx-4 bg-surface-container-lowest border border-white/10 p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Flag size={20} className="text-primary" />
                </div>
                <p className="text-primary font-headline font-bold text-lg">Denúncia enviada</p>
                <p className="text-white/40 text-sm mt-2">Obrigado pelo teu feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-headline font-bold text-white uppercase tracking-tight">
                    Denunciar Conteúdo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <fieldset className="mb-4">
                    <legend className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">
                      Razão
                    </legend>
                    <div className="space-y-2">
                      {REASONS.map((r) => (
                        <label
                          key={r.value}
                          className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                            reason === r.value
                              ? "bg-primary/5 border-primary/30 text-white"
                              : "bg-surface-container border-white/5 text-white/60 hover:border-white/10"
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
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              reason === r.value ? "border-primary" : "border-white/20"
                            }`}
                          >
                            {reason === r.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="text-sm">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mb-4">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2">
                      Detalhes (opcional)
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="w-full bg-surface-container border border-white/5 focus:border-tertiary/50 text-white text-sm p-3 placeholder:text-white/20 resize-none transition-all outline-none"
                      placeholder="Descreve o problema..."
                    />
                  </div>

                  {error && <p className="text-error text-xs font-mono mb-3">{error}</p>}

                  <div className="flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 text-xs font-mono text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !reason}
                      className="flex items-center gap-2 px-5 py-2 bg-error/90 text-white font-bold text-xs uppercase hover:bg-error transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Flag size={14} />
                      )}
                      Denunciar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
