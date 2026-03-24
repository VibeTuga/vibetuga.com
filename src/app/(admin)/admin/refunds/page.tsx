import { RefundsManager } from "./RefundsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reembolsos | Admin | VibeTuga",
};

export default function AdminRefundsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Gestão de Reembolsos
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Pedidos de reembolso dos compradores
        </p>
      </div>

      <RefundsManager />
    </div>
  );
}
