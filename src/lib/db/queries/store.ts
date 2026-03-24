import { cache } from "react";
import { db } from "@/lib/db";
import {
  storeProducts,
  storePurchases,
  storeReviews,
  storeWishlists,
  storeCollections,
  storeCollectionProducts,
  storeBundleItems,
  users,
} from "@/lib/db/schema";
import { eq, desc, asc, and, or, count, sql, ilike } from "drizzle-orm";

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
      isBundle: storeProducts.isBundle,
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

// ─── Wishlists ────────────────────────────────────────────

export async function getUserWishlistProductIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: storeWishlists.productId })
    .from(storeWishlists)
    .where(eq(storeWishlists.userId, userId));
  return rows.map((r) => r.productId);
}

export const getUserWishlist = cache(async (userId: string) => {
  return db
    .select({
      id: storeWishlists.id,
      productId: storeWishlists.productId,
      createdAt: storeWishlists.createdAt,
      productTitle: storeProducts.title,
      productSlug: storeProducts.slug,
      productType: storeProducts.productType,
      priceCents: storeProducts.priceCents,
      coverImage: storeProducts.coverImage,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
      avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
        "avg_rating",
      ),
      reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
    })
    .from(storeWishlists)
    .innerJoin(storeProducts, eq(storeWishlists.productId, storeProducts.id))
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
    .where(and(eq(storeWishlists.userId, userId), eq(storeProducts.status, "approved")))
    .groupBy(storeWishlists.id, storeProducts.id, users.id)
    .orderBy(desc(storeWishlists.createdAt));
});

export async function isProductInWishlist(userId: string, productId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: storeWishlists.id })
    .from(storeWishlists)
    .where(and(eq(storeWishlists.userId, userId), eq(storeWishlists.productId, productId)))
    .limit(1);
  return !!row;
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: storeWishlists.id })
    .from(storeWishlists)
    .where(and(eq(storeWishlists.userId, userId), eq(storeWishlists.productId, productId)))
    .limit(1);

  if (existing) {
    await db.delete(storeWishlists).where(eq(storeWishlists.id, existing.id));
    return false; // removed
  }

  await db.insert(storeWishlists).values({ userId, productId });
  return true; // added
}

// ─── Store Collections ────────────────────────────────────

export const getFeaturedCollections = cache(async () => {
  const cols = await db
    .select({
      id: storeCollections.id,
      name: storeCollections.name,
      slug: storeCollections.slug,
      description: storeCollections.description,
      coverImage: storeCollections.coverImage,
      isFeatured: storeCollections.isFeatured,
      sortOrder: storeCollections.sortOrder,
      createdAt: storeCollections.createdAt,
      productCount: sql<number>`count(${storeCollectionProducts.id})::int`.as("product_count"),
    })
    .from(storeCollections)
    .leftJoin(
      storeCollectionProducts,
      eq(storeCollections.id, storeCollectionProducts.collectionId),
    )
    .where(eq(storeCollections.isFeatured, true))
    .groupBy(storeCollections.id)
    .orderBy(asc(storeCollections.sortOrder));

  return cols;
});

export const getAllCollections = cache(async () => {
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
      productCount: sql<number>`count(${storeCollectionProducts.id})::int`.as("product_count"),
    })
    .from(storeCollections)
    .leftJoin(
      storeCollectionProducts,
      eq(storeCollections.id, storeCollectionProducts.collectionId),
    )
    .groupBy(storeCollections.id)
    .orderBy(asc(storeCollections.sortOrder));
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
      createdAt: storeProducts.createdAt,
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
    .where(
      and(
        eq(storeCollectionProducts.collectionId, collection.id),
        eq(storeProducts.status, "approved"),
      ),
    )
    .groupBy(storeCollectionProducts.id, storeProducts.id, users.id)
    .orderBy(asc(storeCollectionProducts.sortOrder));

  return { ...collection, products };
});

export async function getCollectionProductIds(collectionId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: storeCollectionProducts.productId })
    .from(storeCollectionProducts)
    .where(eq(storeCollectionProducts.collectionId, collectionId))
    .orderBy(asc(storeCollectionProducts.sortOrder));
  return rows.map((r) => r.productId);
}

// ─── Bundle Items ─────────────────────────────────────────

export const getBundleItems = cache(async (bundleId: string) => {
  return db
    .select({
      id: storeBundleItems.id,
      productId: storeBundleItems.productId,
      sortOrder: storeBundleItems.sortOrder,
      productTitle: storeProducts.title,
      productSlug: storeProducts.slug,
      productType: storeProducts.productType,
      priceCents: storeProducts.priceCents,
      coverImage: storeProducts.coverImage,
    })
    .from(storeBundleItems)
    .innerJoin(storeProducts, eq(storeBundleItems.productId, storeProducts.id))
    .where(eq(storeBundleItems.bundleId, bundleId))
    .orderBy(asc(storeBundleItems.sortOrder));
});

// ─── Types ───────────────────────────────────────────────

export type StoreProduct = Awaited<ReturnType<typeof getApprovedProducts>>["products"][number];
export type StoreProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type SellerProduct = Awaited<ReturnType<typeof getSellerProducts>>[number];
export type PendingProduct = Awaited<ReturnType<typeof getPendingProducts>>[number];
export type AdminProduct = Awaited<ReturnType<typeof getProductsForAdmin>>[number];
export type UserPurchase = Awaited<ReturnType<typeof getUserPurchases>>[number];
export type WishlistItem = Awaited<ReturnType<typeof getUserWishlist>>[number];
export type StoreCollection = Awaited<ReturnType<typeof getAllCollections>>[number];
export type StoreCollectionDetail = NonNullable<Awaited<ReturnType<typeof getCollectionBySlug>>>;
export type BundleItem = Awaited<ReturnType<typeof getBundleItems>>[number];
