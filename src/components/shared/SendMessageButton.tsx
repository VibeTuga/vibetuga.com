"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function SendMessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/dashboard/messages?to=${targetUserId}`)}
      className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest border border-white/10 text-white/60 hover:text-primary hover:border-primary/30 transition-all rounded-md"
    >
      <MessageCircle size={14} />
      Enviar Mensagem
    </button>
  );
}
