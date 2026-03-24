import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BlogPostForm } from "../../BlogPostForm";

async function getPost(id: string) {
  try {
    const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return results[0] ?? null;
  } catch {
    return null;
  }
}

async function getCategories() {
  try {
    return await db
      .select({ id: blogCategories.id, name: blogCategories.name })
      .from(blogCategories)
      .orderBy(asc(blogCategories.sortOrder));
  } catch {
    return [];
  }
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPost(id), getCategories()]);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Editar Post
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">{post.title}</p>
      </div>

      <BlogPostForm
        categories={categories}
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          categoryId: post.categoryId ?? "",
          tags: post.tags?.join(", ") ?? "",
          coverImage: post.coverImage ?? "",
          status: post.status,
          postType: post.postType,
          scheduledPublishAt: post.scheduledPublishAt
            ? new Date(post.scheduledPublishAt).toISOString().slice(0, 16)
            : undefined,
        }}
      />
    </div>
  );
}
