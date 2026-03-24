import { db } from "@/lib/db";
import { blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PendingPostsTable } from "./PendingPostsTable";

async function getPendingPosts() {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      postType: blogPosts.postType,
      createdAt: blogPosts.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
      categoryName: blogCategories.name,
      categoryColor: blogCategories.color,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogPosts.status, "pending_review"))
    .orderBy(desc(blogPosts.createdAt));
}

export default async function PendingPostsPage() {
  const posts = await getPendingPosts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Posts Pendentes
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Posts da comunidade aguardando aprovação
        </p>
      </div>

      <PendingPostsTable posts={posts} />
    </div>
  );
}
