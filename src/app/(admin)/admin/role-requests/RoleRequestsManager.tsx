"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Loader2, Shield } from "lucide-react";

interface RoleRequest {
  id: string;
  requestedRole: string;
  reason: string;
  status: string;
  reviewNote: string | null;
  createdAt: Date;
  userId: string;
  userName: string;
  userDisplayName: string | null;
  userImage: string | null;
  userRole: string;
}

export function RoleRequestsManager({ initialRequests }: { initialRequests: RoleRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/role-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao processar pedido");
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r,
        ),
      );
    } catch {
      alert("Erro ao processar pedido");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          Pedidos de Role
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Gere os pedidos de upgrade de role dos membros.
        </p>
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">
          Pendentes ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-surface-container-low rounded-lg p-8 text-center">
            <p className="text-sm text-white/30">Sem pedidos pendentes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-surface-container-low rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {req.userImage ? (
                      <Image
                        src={req.userImage}
                        alt={req.userName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {(req.userDisplayName || req.userName).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {req.userDisplayName || req.userName}
                      </p>
                      <p className="text-[10px] font-mono text-white/30">@{req.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-mono uppercase rounded">
                      {req.requestedRole}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">
                      {new Date(req.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/60 bg-surface-container rounded-lg p-3">
                  {req.reason}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={processingId === req.id}
                    onClick={() => handleAction(req.id, "approve")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={processingId === req.id}
                    onClick={() => handleAction(req.id, "reject")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Processed */}
      {processedRequests.length > 0 && (
        <section>
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">
            Processados ({processedRequests.length})
          </h2>
          <div className="bg-surface-container-low rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 font-mono text-white/30 uppercase">Utilizador</th>
                  <th className="text-left p-3 font-mono text-white/30 uppercase">Role</th>
                  <th className="text-left p-3 font-mono text-white/30 uppercase">Estado</th>
                  <th className="text-left p-3 font-mono text-white/30 uppercase">Data</th>
                </tr>
              </thead>
              <tbody>
                {processedRequests.map((req) => (
                  <tr key={req.id} className="border-b border-white/5 last:border-0">
                    <td className="p-3 text-white/60">{req.userDisplayName || req.userName}</td>
                    <td className="p-3">
                      <span className="text-tertiary font-mono">{req.requestedRole}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                          req.status === "approved"
                            ? "bg-primary/10 text-primary"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {req.status === "approved" ? "Aprovado" : "Rejeitado"}
                      </span>
                    </td>
                    <td className="p-3 text-white/30 font-mono">
                      {new Date(req.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
