import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeWishlists, storeProducts, users, storeReviews } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const wishlist = await db
      .select({
        id: storeWishlists.id,
        productId: storeWishlists.productId,
        createdAt: storeWishlists.createdAt,
        title: storeProducts.title,
        slug: storeProducts.slug,
        priceCents: storeProducts.priceCents,
        productType: storeProducts.productType,
        coverImage: storeProducts.coverImage,
        sellerName: users.discordUsername,
        sellerDisplayName: users.displayName,
        avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
          "avg_rating",
        ),
        reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
      })
      .from(storeWishlists)
      .innerJoin(storeProducts, eq(storeWishlists.productId, storeProducts.id))
      .leftJoin(users, eq(storeProducts.sellerId, users.id))
      .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
      .where(eq(storeWishlists.userId, session.user.id))
      .groupBy(storeWishlists.id, storeProducts.id, users.id)
      .orderBy(desc(storeWishlists.createdAt));

    return NextResponse.json({ wishlist });
  } catch {
    return NextResponse.json({ error: "Erro ao obter lista de desejos." }, { status: 500 });
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
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
    }

    const [product] = await db
      .select({ id: storeProducts.id })
      .from(storeProducts)
      .where(eq(storeProducts.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const existing = await db
      .select({ id: storeWishlists.id })
      .from(storeWishlists)
      .where(
        and(eq(storeWishlists.userId, session.user.id), eq(storeWishlists.productId, productId)),
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(storeWishlists).where(eq(storeWishlists.id, existing[0].id));

      return NextResponse.json({ added: false, message: "Removido da lista de desejos." });
    }

    await db.insert(storeWishlists).values({
      userId: session.user.id,
      productId,
    });

    return NextResponse.json({ added: true, message: "Adicionado à lista de desejos." });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar lista de desejos." }, { status: 500 });
  }
}
