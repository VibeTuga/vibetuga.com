import { db } from "@/lib/db";
import { blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vibetuga.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      categoryName: blogCategories.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(50);

  const items = posts
    .map((post) => {
      const author = post.authorDisplayName || post.authorName || "VibeTuga";
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(author)}</author>${
        post.categoryName
          ? `
      <category>${escapeXml(post.categoryName)}</category>`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VibeTuga Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Artigos, tutoriais e deep dives sobre vibe coding. A comunidade portuguesa de desenvolvimento assistido por IA.</description>
    <language>pt</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
