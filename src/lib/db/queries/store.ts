import { cache } from "react";
import { db } from "@/lib/db";
import {
  storeProducts,
  storePurchases,
  storeReviews,
  storeWishlists,
  storeRefunds,
  productUpdates,
  storeCollections,
  storeCollectionProducts,
  users,
} from "@/lib/db/schema";
import { eq, desc, and, or, count, sql, ilike, asc, gte } from "drizzle-orm";

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
      previewContent: storeProducts.previewContent,
      demoUrl: storeProducts.demoUrl,
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

// ─── Seller Analytics ──────────────────────────────────────

export const getSellerAnalytics = cache(async (sellerId: string) => {
  const [totals] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
      totalSales: sql<number>`count(${storePurchases.id})::int`,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(eq(storeProducts.sellerId, sellerId));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySales = await db
    .select({
      date: sql<string>`to_char(${storePurchases.createdAt}::date, 'YYYY-MM-DD')`.as("date"),
      sales: sql<number>`count(${storePurchases.id})::int`.as("sales"),
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(and(eq(storeProducts.sellerId, sellerId), gte(storePurchases.createdAt, thirtyDaysAgo)))
    .groupBy(sql`${storePurchases.createdAt}::date`)
    .orderBy(sql`${storePurchases.createdAt}::date`);

  const topProducts = await db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      productType: storeProducts.productType,
      priceCents: storeProducts.priceCents,
      salesCount: sql<number>`count(${storePurchases.id})::int`.as("sales_count"),
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
    })
    .from(storeProducts)
    .leftJoin(storePurchases, eq(storeProducts.id, storePurchases.productId))
    .where(eq(storeProducts.sellerId, sellerId))
    .groupBy(storeProducts.id)
    .orderBy(desc(sql`coalesce(sum(${storePurchases.pricePaidCents}), 0)`))
    .limit(10);

  return {
    totalRevenue: totals?.totalRevenue ?? 0,
    totalSales: totals?.totalSales ?? 0,
    dailySales,
    topProducts,
  };
});

// ─── Wishlist ──────────────────────────────────────────────

export const getUserWishlist = cache(async (userId: string) => {
  return db
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
    })
    .from(storeWishlists)
    .innerJoin(storeProducts, eq(storeWishlists.productId, storeProducts.id))
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(eq(storeWishlists.userId, userId))
    .orderBy(desc(storeWishlists.createdAt));
});

export const getUserWishlistProductIds = cache(async (userId: string) => {
  const rows = await db
    .select({ productId: storeWishlists.productId })
    .from(storeWishlists)
    .where(eq(storeWishlists.userId, userId));
  return rows.map((r) => r.productId);
});

// ─── Product Updates ───────────────────────────────────────

export const getProductUpdates = cache(async (productId: string) => {
  return db
    .select()
    .from(productUpdates)
    .where(eq(productUpdates.productId, productId))
    .orderBy(desc(productUpdates.createdAt));
});

// ─── Collections ───────────────────────────────────────────

export const getCollections = cache(async () => {
  return db
    .select({
      id: storeCollections.id,
      name: storeCollections.name,
      slug: storeCollections.slug,
      description: storeCollections.description,
      coverImage: storeCollections.coverImage,
      isFeatured: storeCollections.isFeatured,
      sortOrder: storeCollections.sortOrder,
      createdAt: storeCollections.createdAt,
      productCount: sql<number>`count(${storeCollectionProducts.productId})::int`.as(
        "product_count",
      ),
    })
    .from(storeCollections)
    .leftJoin(
      storeCollectionProducts,
      eq(storeCollections.id, storeCollectionProducts.collectionId),
    )
    .groupBy(storeCollections.id)
    .orderBy(asc(storeCollections.sortOrder), desc(storeCollections.createdAt));
});

export const getFeaturedCollections = cache(async (limit = 3) => {
  return db
    .select({
      id: storeCollections.id,
      name: storeCollections.name,
      slug: storeCollections.slug,
      description: storeCollections.description,
      coverImage: storeCollections.coverImage,
      productCount: sql<number>`count(${storeCollectionProducts.productId})::int`.as(
        "product_count",
      ),
    })
    .from(storeCollections)
    .leftJoin(
      storeCollectionProducts,
      eq(storeCollections.id, storeCollectionProducts.collectionId),
    )
    .where(eq(storeCollections.isFeatured, true))
    .groupBy(storeCollections.id)
    .orderBy(asc(storeCollections.sortOrder))
    .limit(limit);
});

export const getCollectionBySlug = cache(async (slug: string) => {
  const [collection] = await db
    .select()
    .from(storeCollections)
    .where(eq(storeCollections.slug, slug))
    .limit(1);

  if (!collection) return null;

  const products = await db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
      avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
        "avg_rating",
      ),
      reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
    })
    .from(storeCollectionProducts)
    .innerJoin(storeProducts, eq(storeCollectionProducts.productId, storeProducts.id))
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
    .where(eq(storeCollectionProducts.collectionId, collection.id))
    .groupBy(storeProducts.id, storeCollectionProducts.sortOrder, users.id)
    .orderBy(asc(storeCollectionProducts.sortOrder));

  return { ...collection, products };
});

// ─── Purchase Refunds ─────────────────────────────────────

export const getPurchaseRefunds = cache(async (userId: string) => {
  return db
    .select({
      id: storeRefunds.id,
      purchaseId: storeRefunds.purchaseId,
      status: storeRefunds.status,
      reason: storeRefunds.reason,
      adminNotes: storeRefunds.adminNotes,
      createdAt: storeRefunds.createdAt,
      resolvedAt: storeRefunds.resolvedAt,
    })
    .from(storeRefunds)
    .where(eq(storeRefunds.buyerId, userId))
    .orderBy(desc(storeRefunds.createdAt));
});

// ─── Types ─────────────────────────────────────────────────

export type StoreProduct = Awaited<ReturnType<typeof getApprovedProducts>>["products"][number];
export type StoreProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type SellerProduct = Awaited<ReturnType<typeof getSellerProducts>>[number];
export type PendingProduct = Awaited<ReturnType<typeof getPendingProducts>>[number];
export type AdminProduct = Awaited<ReturnType<typeof getProductsForAdmin>>[number];
export type UserPurchase = Awaited<ReturnType<typeof getUserPurchases>>[number];
export type SellerAnalytics = Awaited<ReturnType<typeof getSellerAnalytics>>;
export type WishlistItem = Awaited<ReturnType<typeof getUserWishlist>>[number];
export type CollectionWithCount = Awaited<ReturnType<typeof getCollections>>[number];
export type CollectionDetail = NonNullable<Awaited<ReturnType<typeof getCollectionBySlug>>>;
