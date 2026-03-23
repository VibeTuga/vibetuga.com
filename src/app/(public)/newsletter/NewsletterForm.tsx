"use client";

import { useState } from "react";

export function NewsletterForm({ source = "newsletter_page" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message ?? "Subscrito com sucesso!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Erro ao subscrever. Tenta novamente.");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de ligação. Tenta novamente.");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md">
        <div className="border border-primary/30 bg-primary/5 p-6 text-center">
          <p className="font-mono text-primary text-sm">
            <span className="font-bold">[OK]</span> {message}
          </p>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">
            Até breve na tua caixa de entrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-mono text-sm select-none">
            $
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teu@email.pt"
            required
            disabled={status === "loading"}
            className="w-full bg-surface-container-lowest border border-white/10 focus:border-primary/50 focus:ring-0 text-sm py-4 pl-8 pr-4 text-white placeholder:text-white/20 font-mono transition-all outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-4 bg-primary text-on-primary font-bold font-headline uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "..." : "Subscrever"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-error font-mono text-xs mt-3 uppercase tracking-widest">
          [ERR] {message}
        </p>
      )}

      <p className="text-[10px] text-white/20 font-mono mt-4 uppercase tracking-widest">
        Sem spam. Cancelar a qualquer momento.
      </p>
    </div>
  );
}
