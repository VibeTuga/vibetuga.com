import { cache } from "react";
import { db } from "@/lib/db";
import { blogSeries, blogSeriesPosts, blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, desc, asc, and, sql, count } from "drizzle-orm";

const SERIES_PER_PAGE = 12;

export const getAllSeries = cache(async (page = 1) => {
  const offset = (page - 1) * SERIES_PER_PAGE;

  const [seriesResult, totalResult] = await Promise.all([
    db
      .select({
        id: blogSeries.id,
        title: blogSeries.title,
        slug: blogSeries.slug,
        description: blogSeries.description,
        coverImage: blogSeries.coverImage,
        sortOrder: blogSeries.sortOrder,
        createdAt: blogSeries.createdAt,
        authorId: blogSeries.authorId,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        postCount:
          sql<number>`(SELECT count(*)::int FROM blog_series_post WHERE blog_series_post.series_id = blog_series.id)`.as(
            "post_count",
          ),
      })
      .from(blogSeries)
      .leftJoin(users, eq(blogSeries.authorId, users.id))
      .orderBy(asc(blogSeries.sortOrder), desc(blogSeries.createdAt))
      .limit(SERIES_PER_PAGE)
      .offset(offset),
    db.select({ count: count() }).from(blogSeries),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    series: seriesResult,
    total,
    totalPages: Math.ceil(total / SERIES_PER_PAGE),
    currentPage: page,
  };
});

export const getSeriesBySlug = cache(async (slug: string) => {
  const [series] = await db
    .select({
      id: blogSeries.id,
      title: blogSeries.title,
      slug: blogSeries.slug,
      description: blogSeries.description,
      coverImage: blogSeries.coverImage,
      authorId: blogSeries.authorId,
      sortOrder: blogSeries.sortOrder,
      createdAt: blogSeries.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
    })
    .from(blogSeries)
    .leftJoin(users, eq(blogSeries.authorId, users.id))
    .where(eq(blogSeries.slug, slug))
    .limit(1);

  if (!series) return null;

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      readingTimeMinutes: blogPosts.readingTimeMinutes,
      viewsCount: blogPosts.viewsCount,
      likesCount: blogPosts.likesCount,
      publishedAt: blogPosts.publishedAt,
      status: blogPosts.status,
      order: blogSeriesPosts.order,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      categoryColor: blogCategories.color,
    })
    .from(blogSeriesPosts)
    .innerJoin(blogPosts, eq(blogSeriesPosts.postId, blogPosts.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogSeriesPosts.seriesId, series.id))
    .orderBy(asc(blogSeriesPosts.order));

  return { ...series, posts };
});

export const getUserSeries = cache(async (userId: string) => {
  return db
    .select({
      id: blogSeries.id,
      title: blogSeries.title,
      slug: blogSeries.slug,
      description: blogSeries.description,
      coverImage: blogSeries.coverImage,
      sortOrder: blogSeries.sortOrder,
      createdAt: blogSeries.createdAt,
      updatedAt: blogSeries.updatedAt,
      postCount:
        sql<number>`(SELECT count(*)::int FROM blog_series_post WHERE blog_series_post.series_id = blog_series.id)`.as(
          "post_count",
        ),
    })
    .from(blogSeries)
    .where(eq(blogSeries.authorId, userId))
    .orderBy(desc(blogSeries.createdAt));
});

export const getSeriesForPost = cache(async (postId: string) => {
  const entries = await db
    .select({
      seriesId: blogSeriesPosts.seriesId,
      order: blogSeriesPosts.order,
      seriesTitle: blogSeries.title,
      seriesSlug: blogSeries.slug,
    })
    .from(blogSeriesPosts)
    .innerJoin(blogSeries, eq(blogSeriesPosts.seriesId, blogSeries.id))
    .where(eq(blogSeriesPosts.postId, postId))
    .limit(1);

  if (entries.length === 0) return null;

  const entry = entries[0];

  // Get all posts in this series for navigation
  const seriesPosts = await db
    .select({
      postId: blogSeriesPosts.postId,
      order: blogSeriesPosts.order,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
    })
    .from(blogSeriesPosts)
    .innerJoin(blogPosts, eq(blogSeriesPosts.postId, blogPosts.id))
    .where(eq(blogSeriesPosts.seriesId, entry.seriesId))
    .orderBy(asc(blogSeriesPosts.order));

  const currentIndex = seriesPosts.findIndex((p) => p.postId === postId);
  const publishedPosts = seriesPosts.filter((p) => p.status === "published");

  return {
    seriesTitle: entry.seriesTitle,
    seriesSlug: entry.seriesSlug,
    currentOrder: entry.order,
    totalPosts: seriesPosts.length,
    posts: publishedPosts,
    prev: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    next: currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null,
  };
});

export const getUserPublishedPosts = cache(async (userId: string) => {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(eq(blogPosts.authorId, userId), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.publishedAt));
});
