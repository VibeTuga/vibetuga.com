import { cache } from "react";
import { db } from "@/lib/db";
import { blogPosts, blogCategories, users } from "@/lib/db/schema";
import { eq, desc, asc, and, or, ilike, sql, count, lt, gt, ne } from "drizzle-orm";

const POSTS_PER_PAGE = 12;

type BlogFilters = {
  category?: string;
  tag?: string;
  q?: string;
  sort?: string;
  page?: number;
};

export const getPublishedPosts = cache(async (filters: BlogFilters) => {
  const { category, tag, q, sort = "latest", page = 1 } = filters;

  try {
    const conditions: ReturnType<typeof eq>[] = [eq(blogPosts.status, "published")];

    if (category) {
      const [cat] = await db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(eq(blogCategories.slug, category))
        .limit(1);
      if (cat) {
        conditions.push(eq(blogPosts.categoryId, cat.id));
      }
    }

    if (q) {
      const searchCondition = or(
        ilike(blogPosts.title, `%${q}%`),
        ilike(blogPosts.excerpt, `%${q}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (tag) {
      conditions.push(sql`${blogPosts.tags} @> ARRAY[${tag}]::text[]`);
    }

    const whereClause = and(...conditions);

    let orderBy;
    switch (sort) {
      case "popular":
        orderBy = desc(blogPosts.viewsCount);
        break;
      case "oldest":
        orderBy = asc(blogPosts.publishedAt);
        break;
      default:
        orderBy = desc(blogPosts.publishedAt);
    }

    const offset = (page - 1) * POSTS_PER_PAGE;

    const [postsResult, totalResult] = await Promise.all([
      db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          coverImage: blogPosts.coverImage,
          postType: blogPosts.postType,
          tags: blogPosts.tags,
          readingTimeMinutes: blogPosts.readingTimeMinutes,
          viewsCount: blogPosts.viewsCount,
          likesCount: blogPosts.likesCount,
          publishedAt: blogPosts.publishedAt,
          authorName: users.discordUsername,
          authorDisplayName: users.displayName,
          authorImage: users.image,
          authorRole: users.role,
          categoryName: blogCategories.name,
          categorySlug: blogCategories.slug,
          categoryColor: blogCategories.color,
          commentsCount:
            sql<number>`(SELECT count(*)::int FROM blog_comment WHERE blog_comment.post_id = blog_post.id AND blog_comment.is_approved = true)`.as(
              "comments_count",
            ),
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(POSTS_PER_PAGE)
        .offset(offset),
      db.select({ count: count() }).from(blogPosts).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      posts: postsResult,
      total,
      totalPages: Math.ceil(total / POSTS_PER_PAGE),
      currentPage: page,
    };
  } catch {
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }
});

export const getPostBySlug = cache(async (slug: string) => {
  const [post] = await db
    .select({
      id: blogPosts.id,
      authorId: blogPosts.authorId,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverImage: blogPosts.coverImage,
      postType: blogPosts.postType,
      tags: blogPosts.tags,
      categoryId: blogPosts.categoryId,
      readingTimeMinutes: blogPosts.readingTimeMinutes,
      viewsCount: blogPosts.viewsCount,
      likesCount: blogPosts.likesCount,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
      authorRole: users.role,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      categoryColor: blogCategories.color,
      commentsCount:
        sql<number>`(SELECT count(*)::int FROM blog_comment WHERE blog_comment.post_id = blog_post.id AND blog_comment.is_approved = true)`.as(
          "comments_count",
        ),
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  return post ?? null;
});

export const getAdjacentPosts = cache(async (publishedAt: Date | null, _currentId: string) => {
  if (!publishedAt) return { prev: null, next: null };

  const [prevResult, nextResult] = await Promise.all([
    db
      .select({ slug: blogPosts.slug, title: blogPosts.title })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), lt(blogPosts.publishedAt, publishedAt)))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(1),
    db
      .select({ slug: blogPosts.slug, title: blogPosts.title })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), gt(blogPosts.publishedAt, publishedAt)))
      .orderBy(asc(blogPosts.publishedAt))
      .limit(1),
  ]);

  return {
    prev: prevResult[0] ?? null,
    next: nextResult[0] ?? null,
  };
});

export const getCategories = cache(async () => {
  try {
    return await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        color: blogCategories.color,
      })
      .from(blogCategories)
      .orderBy(asc(blogCategories.sortOrder));
  } catch {
    return [];
  }
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const [category] = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug))
    .limit(1);
  return category ?? null;
});

export const getRelatedPosts = cache(
  async (postId: string, tags: string[] | null, categoryId: string | null, limit = 3) => {
    const conditions: ReturnType<typeof eq>[] = [
      eq(blogPosts.status, "published"),
      ne(blogPosts.id, postId),
    ];

    if (categoryId) {
      conditions.push(eq(blogPosts.categoryId, categoryId));
    }

    const baseWhere = and(...conditions);

    // If there are tags, score by overlap count and order by that + recency
    if (tags && tags.length > 0) {
      const tagMatchCount = sql<number>`coalesce(array_length(${blogPosts.tags} & ${sql`ARRAY[${sql.join(
        tags.map((t) => sql`${t}`),
        sql`,`,
      )}]::text[]`}, 1), 0)`;

      return db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          coverImage: blogPosts.coverImage,
          postType: blogPosts.postType,
          tags: blogPosts.tags,
          readingTimeMinutes: blogPosts.readingTimeMinutes,
          viewsCount: blogPosts.viewsCount,
          likesCount: blogPosts.likesCount,
          publishedAt: blogPosts.publishedAt,
          authorName: users.discordUsername,
          authorDisplayName: users.displayName,
          authorImage: users.image,
          authorRole: users.role,
          categoryName: blogCategories.name,
          categorySlug: blogCategories.slug,
          categoryColor: blogCategories.color,
          commentsCount:
            sql<number>`(SELECT count(*)::int FROM blog_comment WHERE blog_comment.post_id = blog_post.id AND blog_comment.is_approved = true)`.as(
              "comments_count",
            ),
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(baseWhere)
        .orderBy(desc(tagMatchCount), desc(blogPosts.publishedAt))
        .limit(limit);
    }

    // No tags — just match by category + recency
    return db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        postType: blogPosts.postType,
        tags: blogPosts.tags,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        authorRole: users.role,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
        commentsCount:
          sql<number>`(SELECT count(*)::int FROM blog_comment WHERE blog_comment.post_id = blog_post.id AND blog_comment.is_approved = true)`.as(
            "comments_count",
          ),
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(baseWhere)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  },
);

export const getPostsByTag = cache(async (tag: string, page = 1) => {
  const whereClause = and(
    eq(blogPosts.status, "published"),
    sql`${blogPosts.tags} @> ARRAY[${tag}]::text[]`,
  );

  const offset = (page - 1) * POSTS_PER_PAGE;

  const [postsResult, totalResult] = await Promise.all([
    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        postType: blogPosts.postType,
        tags: blogPosts.tags,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        authorRole: users.role,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
        commentsCount:
          sql<number>`(SELECT count(*)::int FROM blog_comment WHERE blog_comment.post_id = blog_post.id AND blog_comment.is_approved = true)`.as(
            "comments_count",
          ),
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db.select({ count: count() }).from(blogPosts).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    posts: postsResult,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    currentPage: page,
  };
});

export const getPostBasicById = cache(async (id: string) => {
  const [post] = await db
    .select({
      id: blogPosts.id,
      authorId: blogPosts.authorId,
      title: blogPosts.title,
      slug: blogPosts.slug,
    })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return post ?? null;
});

export type BlogPost = Awaited<ReturnType<typeof getPublishedPosts>>["posts"][number];
export type BlogPostDetail = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;
