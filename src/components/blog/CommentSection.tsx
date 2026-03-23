"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MessageSquare, Reply, Send, Loader2 } from "lucide-react";
import { formatDatePT } from "@/lib/blog-utils";

type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string | null;
  authorDisplayName: string | null;
  authorImage: string | null;
  authorRole: string | null;
  children: Comment[];
};

function CommentForm({
  postId,
  parentId,
  onSubmitted,
  onCancel,
  placeholder,
}: {
  postId: string;
  parentId?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, parentId: parentId || null, content: content.trim() }),
      });

      if (res.status === 401) {
        setError("Precisas de fazer login para comentar.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao enviar comentário.");
        return;
      }

      setContent("");
      onSubmitted();
    } catch {
      setError("Erro ao enviar comentário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || "Escreve o teu comentário..."}
        rows={3}
        className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-none transition-all outline-none"
      />
      {error && <p className="text-error text-xs font-mono">{error}</p>}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-mono text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar
        </button>
      </div>
    </form>
  );
}

function CommentNode({
  comment,
  postId,
  depth,
  onRefresh,
}: {
  comment: Comment;
  postId: string;
  depth: number;
  onRefresh: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const authorName = comment.authorDisplayName || comment.authorName || "Anónimo";
  const createdAt = new Date(comment.createdAt);

  return (
    <div className={depth > 0 ? "ml-6 md:ml-10 border-l border-white/5 pl-4 md:pl-6" : ""}>
      <div className="py-4">
        {/* Author header */}
        <div className="flex items-center gap-3 mb-3">
          {comment.authorImage ? (
            <Image
              src={comment.authorImage}
              alt={authorName}
              width={28}
              height={28}
              className="rounded-full border border-primary/20"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-primary/20" />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase">{authorName}</span>
            {comment.authorRole && comment.authorRole !== "member" && (
              <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 uppercase font-mono">
                {comment.authorRole}
              </span>
            )}
            <span className="text-[10px] text-white/20 font-mono">{formatDatePT(createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Actions */}
        {depth < 2 && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-tertiary transition-colors"
          >
            <Reply size={12} />
            Responder
          </button>
        )}

        {/* Inline reply form */}
        {showReply && (
          <div className="mt-4">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSubmitted={() => {
                setShowReply(false);
                onRefresh();
              }}
              onCancel={() => setShowReply(false)}
              placeholder={`Responder a ${authorName}...`}
            />
          </div>
        )}
      </div>

      {/* Children */}
      {comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              postId={postId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(initialCount);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        // Count all comments recursively
        function countAll(items: Comment[]): number {
          return items.reduce((acc, c) => acc + 1 + countAll(c.children), 0);
        }
        setCount(countAll(data));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <section className="border-t border-white/5 pt-8 mt-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare size={20} className="text-tertiary" />
        <h2 className="font-headline text-xl font-bold text-white uppercase tracking-tight">
          Comentários
        </h2>
        <span className="text-xs font-mono text-white/30 bg-surface-container px-2 py-0.5">
          {count}
        </span>
      </div>

      {/* New comment form */}
      <div className="mb-8">
        <CommentForm postId={postId} onSubmitted={fetchComments} />
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-white/20" />
        </div>
      ) : comments.length > 0 ? (
        <div className="divide-y divide-white/[0.03]">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              postId={postId}
              depth={0}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
            NO_COMMENTS_YET
          </p>
          <p className="text-white/20 text-sm mt-2">Sê o primeiro a comentar.</p>
        </div>
      )}
    </section>
  );
}
