"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  reviewerName: string | null;
  reviewerImage: string | null;
};

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
          }
        >
          <svg
            className={`w-4 h-4 ${star <= rating ? "text-primary" : "text-white/20"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/store/reviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newRating === 0) {
      setError("Seleciona uma avaliação.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/store/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao submeter avaliação");
        return;
      }

      setNewRating(0);
      setNewComment("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      await fetchReviews();
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-white/5 pt-12">
      <h2 className="text-2xl font-headline font-bold tracking-tight uppercase mb-8">
        Avaliações
        {reviews.length > 0 && (
          <span className="text-white/40 text-base ml-2">({reviews.length})</span>
        )}
      </h2>

      {/* Review form for authenticated users */}
      {session?.user && (
        <form
          onSubmit={handleSubmit}
          className="mb-12 p-6 bg-surface-container border border-white/5 rounded-xl"
        >
          <h3 className="font-headline font-bold text-sm uppercase tracking-wider mb-4">
            Deixa a tua avaliação
          </h3>

          <div className="mb-4">
            <label className="block text-xs text-white/50 mb-2 font-label uppercase tracking-wider">
              Avaliação
            </label>
            <StarRating rating={newRating} interactive onRate={setNewRating} />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-white/50 mb-2 font-label uppercase tracking-wider">
              Comentário (opcional)
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full bg-surface-container-lowest border border-white/10 px-4 py-3 text-sm text-white focus:border-tertiary focus:ring-0 transition-all outline-none resize-none rounded-sm"
              placeholder="Partilha a tua experiência..."
            />
          </div>

          {error && <p className="text-error text-xs font-mono mb-3">{error}</p>}
          {submitSuccess && (
            <p className="text-primary text-xs font-mono mb-3">Avaliação submetida com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={submitting || newRating === 0}
            className="px-6 py-2 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-widest rounded-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "A submeter..." : "Submeter Avaliação"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 bg-surface-container border border-white/5 rounded-xl animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-4 w-24 bg-white/10 rounded-sm" />
              </div>
              <div className="h-3 w-32 bg-white/5 rounded-sm mb-2" />
              <div className="h-3 w-full bg-white/5 rounded-sm" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-surface-container border border-white/5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.reviewerImage ? (
                    <Image
                      src={review.reviewerImage}
                      alt={review.reviewerName ?? "Reviewer"}
                      width={32}
                      height={32}
                      className="rounded-full border border-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/60">
                        {(review.reviewerName ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold text-white">
                      {review.reviewerName ?? "Utilizador"}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-primary font-label uppercase tracking-widest">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Compra verificada
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-white/30 font-mono">
                  {new Date(review.createdAt).toLocaleDateString("pt-PT")}
                </span>
              </div>

              <StarRating rating={review.rating} />

              {review.comment && (
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/30 text-sm font-mono">
            Ainda não existem avaliações para este produto.
          </p>
        </div>
      )}
    </section>
  );
}
