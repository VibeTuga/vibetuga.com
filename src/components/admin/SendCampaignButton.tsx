"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function SendCampaignButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!confirm("Enviar esta campanha para todos os subscritores ativos?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaignId, action: "send" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar");

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar campanha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send size={11} />
      {loading ? "A enviar..." : "Enviar"}
    </button>
  );
}
