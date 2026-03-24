"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Loader2 } from "lucide-react";

interface PendingProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceCents: number;
  productType: string;
  coverImage: string | null;
  tags: string[] | null;
  createdAt: Date;
  sellerName: string | null;
  sellerDisplayName: string | null;
  sellerImage: string | null;
}

interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceCents: number;
  productType: string;
  status: string;
  coverImage: string | null;
  tags: string[] | null;
  createdAt: Date;
  sellerName: string | null;
  sellerDisplayName: string | null;
  sellerImage: string | null;
}

function formatPrice(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2)}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-error/10 text-error",
    draft: "bg-white/5 text-white/40",
    archived: "bg-white/5 text-white/30",
  };

  return (
    <span
      className={`px-2 py-[2px] text-[9px] font-mono uppercase ${colors[status] ?? "bg-white/5 text-white/30"}`}
    >
      {status}
    </span>
  );
}

export function PendingProductsSection({ products }: { products: PendingProduct[] }) {
  const router = useRouter();
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(productId: string, status: "approved" | "rejected") {
    setActioning(productId);
    try {
      const res = await fetch(`/api/store/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Erro ao atualizar o produto.");
        return;
      }

      router.refresh();
    } catch {
      alert("Erro ao atualizar o produto.");
    } finally {
      setActioning(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 text-center">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest">QUEUE_EMPTY</p>
        <p className="text-white/20 text-sm mt-2">Não há produtos pendentes de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const sellerName = product.sellerDisplayName || product.sellerName || "Anónimo";
        const isActioning = actioning === product.id;

        return (
          <div
            key={product.id}
            className="bg-surface-container-low p-6 hover:bg-surface-container transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {product.sellerImage ? (
                    <Image
                      src={product.sellerImage}
                      alt={sellerName}
                      width={24}
                      height={24}
                      className="rounded-full border border-primary/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-primary/20" />
                  )}
                  <span className="text-xs font-bold text-white uppercase">{sellerName}</span>
                </div>

                <h3 className="text-sm font-headline font-bold text-white mb-1 truncate">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="text-xs text-white/40 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center gap-3 mt-3">
                  <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-tertiary/10 text-tertiary">
                    {product.productType.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-primary font-bold">
                    {formatPrice(product.priceCents)}
                  </span>
                </div>

                <p className="text-[10px] font-mono text-white/20 mt-2">
                  Submetido: {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(product.id, "approved")}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-mono uppercase hover:bg-primary/20 transition-all disabled:opacity-40"
                  title="Aprovar"
                >
                  {isActioning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction(product.id, "rejected")}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-error/10 text-error text-xs font-mono uppercase hover:bg-error/20 transition-all disabled:opacity-40"
                  title="Rejeitar"
                >
                  <X size={14} />
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AllProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(productId: string, action: "approve" | "reject" | "delete") {
    setActioning(productId);
    try {
      if (action === "delete") {
        const res = await fetch(`/api/store/products/${productId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          alert("Erro ao eliminar o produto.");
          return;
        }
      } else {
        const status = action === "approve" ? "approved" : "rejected";
        const res = await fetch(`/api/store/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          alert("Erro ao atualizar o produto.");
          return;
        }
      }

      router.refresh();
    } catch {
      alert("Erro ao processar a ação.");
    } finally {
      setActioning(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 text-center">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest">NO_PRODUCTS</p>
        <p className="text-white/20 text-sm mt-2">Ainda não existem produtos na loja.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Produto
            </th>
            <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Vendedor
            </th>
            <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Tipo
            </th>
            <th className="text-right text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Preço
            </th>
            <th className="text-center text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Estado
            </th>
            <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Data
            </th>
            <th className="text-right text-[10px] font-mono uppercase text-white/30 px-4 py-3">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const sellerName = product.sellerDisplayName || product.sellerName || "Anónimo";
            const isActioning = actioning === product.id;

            return (
              <tr
                key={product.id}
                className="border-b border-white/5 hover:bg-surface-container transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-headline font-bold text-white truncate block max-w-[200px]">
                    {product.title}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-white/60">{sellerName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-tertiary/10 text-tertiary">
                    {product.productType.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-mono text-primary font-bold">
                    {formatPrice(product.priceCents)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono text-white/20">
                    {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {product.status !== "approved" && (
                      <button
                        onClick={() => handleAction(product.id, "approve")}
                        disabled={isActioning}
                        className="p-1.5 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-40"
                        title="Aprovar"
                      >
                        {isActioning ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                    )}
                    {product.status !== "rejected" && (
                      <button
                        onClick={() => handleAction(product.id, "reject")}
                        disabled={isActioning}
                        className="p-1.5 text-error/40 hover:text-error hover:bg-error/10 transition-all disabled:opacity-40"
                        title="Rejeitar"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(product.id, "delete")}
                      disabled={isActioning}
                      className="p-1.5 text-white/20 hover:text-error hover:bg-error/10 transition-all disabled:opacity-40"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
