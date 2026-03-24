import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeProducts, storeReviews, users } from "@/lib/db/schema";
import { eq, desc, and, or, count, sql, ilike } from "drizzle-orm";
import { auth } from "@/lib/auth";

const PRODUCTS_PER_PAGE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get("type");
    const q = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const conditions: ReturnType<typeof eq>[] = [eq(storeProducts.status, "approved")];

    if (productType) {
      conditions.push(
        eq(
          storeProducts.productType,
          productType as
            | "skill"
            | "auto_runner"
            | "agent_kit"
            | "prompt_pack"
            | "template"
            | "course"
            | "guide"
            | "other",
        ),
      );
    }

    if (q) {
      conditions.push(
        or(ilike(storeProducts.title, `%${q}%`), ilike(storeProducts.description, `%${q}%`))!,
      );
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * PRODUCTS_PER_PAGE;

    const [productsResult, totalResult] = await Promise.all([
      db
        .select({
          id: storeProducts.id,
          title: storeProducts.title,
          slug: storeProducts.slug,
          description: storeProducts.description,
          priceCents: storeProducts.priceCents,
          productType: storeProducts.productType,
          coverImage: storeProducts.coverImage,
          tags: storeProducts.tags,
          createdAt: storeProducts.createdAt,
          sellerName: users.discordUsername,
          sellerDisplayName: users.displayName,
          sellerImage: users.image,
          avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
            "avg_rating",
          ),
          reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
        })
        .from(storeProducts)
        .leftJoin(users, eq(storeProducts.sellerId, users.id))
        .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
        .where(whereClause)
        .groupBy(storeProducts.id, users.id)
        .orderBy(desc(storeProducts.createdAt))
        .limit(PRODUCTS_PER_PAGE)
        .offset(offset),
      db.select({ count: count() }).from(storeProducts).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      products: productsResult,
      total,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
      currentPage: page,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Apenas vendedores podem criar produtos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      priceCents,
      productType,
      coverImage,
      tags,
      downloadKey,
      previewContent,
      demoUrl,
    } = body;

    if (!title || !slug || priceCents == null) {
      return NextResponse.json({ error: "Title, slug, and price are required" }, { status: 400 });
    }

    if (typeof title !== "string" || title.length > 255) {
      return NextResponse.json({ error: "Title must be under 255 characters" }, { status: 400 });
    }

    if (typeof slug !== "string" || slug.length > 255) {
      return NextResponse.json({ error: "Slug must be under 255 characters" }, { status: 400 });
    }

    if (typeof priceCents !== "number" || priceCents < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }

    const [product] = await db
      .insert(storeProducts)
      .values({
        sellerId: session.user.id,
        title: title.trim(),
        slug: slug.trim(),
        description: description || null,
        priceCents,
        productType: productType || "other",
        status: "pending",
        coverImage: coverImage || null,
        tags: tags || [],
        downloadKey: downloadKey || null,
        previewContent: previewContent || null,
        demoUrl: demoUrl || null,
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
