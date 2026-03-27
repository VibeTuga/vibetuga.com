"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  FileText,
  Layers,
  Loader2,
  Package,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";

interface CollectionDetail {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CollectionItem {
  id: number;
  itemType: string;
  itemId: string;
  addedAt: string;
  details: {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    excerpt?: string | null;
    coverImage?: string | null;
    authorName?: string | null;
    sellerName?: string | null;
    priceCents?: number | null;
  } | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getItemLink(item: CollectionItem): string {
  if (!item.details) return "#";
  switch (item.itemType) {
    case "blog_post":
      return `/blog/${item.details.slug}`;
    case "showcase_project":
      return `/showcase/${item.details.slug}`;
    case "store_product":
      return `/store/${item.details.slug}`;
    default:
      return "#";
  }
}

function getItemIcon(type: string) {
  switch (type) {
    case "blog_post":
      return FileText;
    case "showcase_project":
      return Layers;
    case "store_product":
      return Package;
    default:
      return Bookmark;
  }
}

function getItemTypeLabel(type: string): string {
  switch (type) {
    case "blog_post":
      return "Post";
    case "showcase_project":
      return "Projeto";
    case "store_product":
      return "Produto";
    default:
      return "Item";
  }
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/me/collections/${collectionId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push("/dashboard/collections");
          return;
        }
        throw new Error("Erro ao carregar coleção");
      }
      const data = await res.json();
      setCollection(data.collection);
      setItems(data.items);
    } catch {
      setError("Erro ao carregar coleção");
    } finally {
      setLoading(false);
    }
  }, [collectionId, router]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  async function handleRemoveItem(itemId: number) {
    setRemovingId(itemId);
    setError(null);
    try {
      const res = await fetch(`/api/users/me/collections/${collectionId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error("Erro ao remover item");
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch {
      setError("Erro ao remover item da coleção");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12 text-white/30">
        <Bookmark size={40} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">Coleção não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/collections"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Voltar às coleções
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bookmark className="text-primary" size={24} />
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-sm text-white/50 mt-1">{collection.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
              <span
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono ${
                  collection.isPublic ? "bg-primary/10 text-primary/70" : "bg-white/5 text-white/30"
                }`}
              >
                {collection.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                {collection.isPublic ? "Pública" : "Privada"}
              </span>
              <span className="font-mono">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertTriangle size={16} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400 text-xs"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Bookmark size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Esta coleção está vazia.</p>
          <p className="text-xs mt-1">
            Adiciona posts, projetos ou produtos à coleção a partir das respetivas páginas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = getItemIcon(item.itemType);
            const typeLabel = getItemTypeLabel(item.itemType);
            const link = getItemLink(item);

            return (
              <div
                key={item.id}
                className="group flex items-center gap-4 p-4 bg-surface-container rounded-lg hover:bg-surface-container-low transition-colors"
              >
                {/* Thumbnail */}
                {item.details?.coverImage ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden shrink-0 bg-black/20">
                    <Image
                      src={item.details.coverImage}
                      alt={item.details.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-white/5 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-white/20" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                        item.itemType === "blog_post"
                          ? "bg-tertiary/10 text-tertiary/70"
                          : item.itemType === "showcase_project"
                            ? "bg-secondary/10 text-secondary/70"
                            : "bg-primary/10 text-primary/70"
                      }`}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  {item.details ? (
                    <>
                      <h3 className="text-sm font-semibold text-white truncate">
                        {item.details.title}
                      </h3>
                      <p className="text-xs text-white/40 truncate">
                        {item.details.excerpt || item.details.description || ""}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
                        {(item.details.authorName || item.details.sellerName) && (
                          <span>{item.details.authorName || item.details.sellerName}</span>
                        )}
                        {item.details.priceCents != null && (
                          <span className="font-mono text-primary/70">
                            {formatPrice(item.details.priceCents)}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-white/30 italic">Item removido ou indisponível</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.details && (
                    <Link
                      href={link}
                      className="p-2 text-white/30 hover:text-primary transition-colors"
                      title="Abrir"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingId === item.id}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Remover da coleção"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
