import { db } from "@/lib/db";
import { blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Link } from "@/lib/navigation";
import { Plus } from "lucide-react";
import { BlogPostsTable } from "./BlogPostsTable";

type PostStatus = "all" | "draft" | "pending_review" | "published" | "archived";

async function getPosts(status?: PostStatus) {
  try {
    const query = db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        postType: blogPosts.postType,
        createdAt: blogPosts.createdAt,
        publishedAt: blogPosts.publishedAt,
        authorName: users.discordUsername,
        categoryName: blogCategories.name,
        categoryColor: blogCategories.color,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .orderBy(desc(blogPosts.createdAt));

    if (status && status !== "all") {
      return query.where(eq(blogPosts.status, status));
    }

    return query;
  } catch {
    return [];
  }
}

async function getStatusCounts() {
  try {
    const results = await db
      .select({
        status: blogPosts.status,
        count: count(),
      })
      .from(blogPosts)
      .groupBy(blogPosts.status);

    const counts: Record<string, number> = { all: 0 };
    for (const row of results) {
      counts[row.status] = row.count;
      counts.all += row.count;
    }
    return counts;
  } catch {
    return { all: 0 };
  }
}

export default async function BlogPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentStatus = (params.status as PostStatus) || "all";
  const posts = await getPosts(currentStatus);
  const statusCounts = await getStatusCounts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
            Blog Posts
          </h1>
          <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
            Gerir todos os artigos do blog
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          <Plus size={16} />
          Novo Post
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {(
          [
            { key: "all", label: "Todos" },
            { key: "draft", label: "Rascunho" },
            { key: "pending_review", label: "Pendentes" },
            { key: "published", label: "Publicados" },
            { key: "archived", label: "Arquivados" },
          ] as const
        ).map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/blog" : `/admin/blog?status=${tab.key}`}
            className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
              currentStatus === tab.key
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-white/40 hover:text-white hover:bg-surface-container"
            }`}
          >
            {tab.label}
            {statusCounts[tab.key] !== undefined && (
              <span className="ml-2 text-white/20">{statusCounts[tab.key]}</span>
            )}
          </Link>
        ))}
      </div>

      <BlogPostsTable posts={posts} />
    </div>
  );
}
