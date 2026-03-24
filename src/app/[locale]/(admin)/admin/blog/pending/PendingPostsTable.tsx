"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Loader2 } from "lucide-react";

interface PendingPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  postType: "admin" | "community" | "guest";
  createdAt: Date;
  authorName: string | null;
  authorDisplayName: string | null;
  authorImage: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

export function PendingPostsTable({ posts }: { posts: PendingPost[] }) {
  const router = useRouter();
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(postId: string, status: "published" | "archived") {
    setActioning(postId);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Erro ao atualizar o post.");
        return;
      }

      router.refresh();
    } catch {
      alert("Erro ao atualizar o post.");
    } finally {
      setActioning(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 text-center">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest">QUEUE_EMPTY</p>
        <p className="text-white/20 text-sm mt-2">Não há posts pendentes de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const authorName = post.authorDisplayName || post.authorName || "Anónimo";
        const isActioning = actioning === post.id;

        return (
          <div
            key={post.id}
            className="bg-surface-container-low p-6 hover:bg-surface-container transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {post.authorImage ? (
                    <Image
                      src={post.authorImage}
                      alt={authorName}
                      width={24}
                      height={24}
                      className="rounded-full border border-primary/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-primary/20" />
                  )}
                  <span className="text-xs font-bold text-white uppercase">{authorName}</span>
                  <span className="text-[8px] bg-white/5 px-1.5 py-0.5 text-white/40 uppercase font-mono">
                    {post.postType}
                  </span>
                  {post.categoryName && (
                    <span
                      className="px-2 py-[2px] text-[9px] font-mono uppercase"
                      style={{
                        backgroundColor: `${post.categoryColor}15`,
                        color: post.categoryColor ?? undefined,
                      }}
                    >
                      {post.categoryName}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-headline font-bold text-white mb-1 truncate">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-xs text-white/40 line-clamp-2">{post.excerpt}</p>
                )}

                <p className="text-[10px] font-mono text-white/20 mt-2">
                  Submetido: {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="p-2 text-white/40 hover:text-tertiary hover:bg-tertiary/10 transition-all"
                  title="Pré-visualizar"
                >
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleAction(post.id, "published")}
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
                  onClick={() => handleAction(post.id, "archived")}
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
