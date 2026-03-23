import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeReviews, storePurchases, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { awardXP } from "@/lib/gamification";

const limiter = rateLimit({ interval: 60_000, limit: 5 });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const reviews = await db
      .select({
        id: storeReviews.id,
        rating: storeReviews.rating,
        comment: storeReviews.comment,
        isVerifiedPurchase: storeReviews.isVerifiedPurchase,
        createdAt: storeReviews.createdAt,
        reviewerName: users.name,
        reviewerImage: users.image,
      })
      .from(storeReviews)
      .leftJoin(users, eq(storeReviews.reviewerId, users.id))
      .where(eq(storeReviews.productId, productId))
      .orderBy(desc(storeReviews.createdAt));

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar avaliações" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "A avaliação deve ser um número inteiro entre 1 e 5" },
        { status: 400 },
      );
    }

    const purchases = await db
      .select({ id: storePurchases.id })
      .from(storePurchases)
      .where(
        and(eq(storePurchases.buyerId, session.user.id), eq(storePurchases.productId, productId)),
      )
      .limit(1);

    const isVerifiedPurchase = purchases.length > 0;

    const [review] = await db
      .insert(storeReviews)
      .values({
        productId,
        reviewerId: session.user.id,
        rating,
        comment: typeof comment === "string" ? comment.trim() || null : null,
        isVerifiedPurchase,
      })
      .returning();

    await awardXP(session.user.id, "product_reviewed", productId);

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao submeter avaliação" }, { status: 500 });
  }
}
