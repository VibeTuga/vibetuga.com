"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ChallengeEntryForm({ challengeId }: { challengeId: number }) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submissionUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionUrl: submissionUrl.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao submeter.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <p className="text-primary font-headline font-semibold">Submissão enviada!</p>
        <p className="text-sm text-white/40 mt-1">+20 XP. Boa sorte!</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest border border-white/5 rounded-lg p-6"
    >
      <h3 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-4">
        Submeter Entrada
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-white/40 mb-1.5">URL do Projeto *</label>
          <input
            type="url"
            required
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/40 mb-1.5">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrição do teu projeto..."
            rows={3}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !submissionUrl.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} />
          {loading ? "A submeter..." : "Participar"}
        </button>
      </div>
    </form>
  );
}
