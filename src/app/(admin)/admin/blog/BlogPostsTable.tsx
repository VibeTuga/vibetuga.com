"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "pending_review" | "published" | "archived";
  postType: "admin" | "community" | "guest";
  createdAt: Date;
  publishedAt: Date | null;
  authorName: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-white/10 text-white/60" },
  pending_review: { label: "Pendente", color: "bg-secondary/10 text-secondary" },
  published: { label: "Publicado", color: "bg-primary/10 text-primary" },
  archived: { label: "Arquivado", color: "bg-white/5 text-white/30" },
};

export function BlogPostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Eliminar "${title}"?`)) return;

    const res = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Erro ao eliminar o post");
      return;
    }
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 text-center">
        <p className="text-white/40 font-mono text-xs uppercase">Nenhum post encontrado</p>
        <Link
          href="/admin/blog/new"
          className="inline-block mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase hover:bg-primary/20 transition-colors"
        >
          Criar primeiro post
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Título
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40 hidden sm:table-cell">
                Autor
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40 hidden md:table-cell">
                Categoria
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Estado
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40 hidden lg:table-cell">
                Data
              </th>
              <th className="text-right px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const statusInfo = statusConfig[post.status];
              return (
                <tr
                  key={post.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-sm text-white hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-[10px] font-mono text-white/20 mt-1">/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      {post.authorName ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {post.categoryName ? (
                      <span
                        className="px-2 py-[2px] text-[9px] font-mono uppercase rounded"
                        style={{
                          backgroundColor: `${post.categoryColor}15`,
                          color: post.categoryColor ?? undefined,
                        }}
                      >
                        {post.categoryName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-[2px] text-[9px] font-mono uppercase rounded ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-[10px] font-mono text-white/40">
                      {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-2 text-white/40 hover:text-tertiary hover:bg-tertiary/10 transition-all"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-white/40 hover:text-error hover:bg-error/10 transition-all"
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
    </div>
  );
}
