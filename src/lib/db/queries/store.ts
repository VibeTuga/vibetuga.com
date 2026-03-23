import { cache } from "react";
import { db } from "@/lib/db";
import { storeProducts, storePurchases, storeReviews, users } from "@/lib/db/schema";
import { eq, desc, and, or, count, sql, ilike } from "drizzle-orm";

const PRODUCTS_PER_PAGE = 12;

type StoreFilters = {
  productType?: string;
  q?: string;
  page?: number;
};

export const getApprovedProducts = cache(async (filters: StoreFilters) => {
  const { productType, q, page = 1 } = filters;

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

  return {
    products: productsResult,
    total,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
});

export const getProductBySlug = cache(async (slug: string) => {
  const [product] = await db
    .select({
      id: storeProducts.id,
      sellerId: storeProducts.sellerId,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      updatedAt: storeProducts.updatedAt,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(and(eq(storeProducts.slug, slug), eq(storeProducts.status, "approved")))
    .limit(1);

  return product ?? null;
});

export const getSellerProducts = cache(async (sellerId: string) => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      updatedAt: storeProducts.updatedAt,
    })
    .from(storeProducts)
    .where(eq(storeProducts.sellerId, sellerId))
    .orderBy(desc(storeProducts.createdAt));
});

export const getProductsForAdmin = cache(async () => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .orderBy(desc(storeProducts.createdAt));
});

export const getPendingProducts = cache(async () => {
  return db
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
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(eq(storeProducts.status, "pending"))
    .orderBy(desc(storeProducts.createdAt));
});

export const getUserPurchases = cache(async (userId: string) => {
  return db
    .select({
      id: storePurchases.id,
      pricePaidCents: storePurchases.pricePaidCents,
      createdAt: storePurchases.createdAt,
      productTitle: storeProducts.title,
      productSlug: storeProducts.slug,
      productType: storeProducts.productType,
      coverImage: storeProducts.coverImage,
      downloadKey: storeProducts.downloadKey,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(eq(storePurchases.buyerId, userId))
    .orderBy(desc(storePurchases.createdAt));
});

export type StoreProduct = Awaited<ReturnType<typeof getApprovedProducts>>["products"][number];
export type StoreProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type SellerProduct = Awaited<ReturnType<typeof getSellerProducts>>[number];
export type PendingProduct = Awaited<ReturnType<typeof getPendingProducts>>[number];
export type AdminProduct = Awaited<ReturnType<typeof getProductsForAdmin>>[number];
export type UserPurchase = Awaited<ReturnType<typeof getUserPurchases>>[number];
