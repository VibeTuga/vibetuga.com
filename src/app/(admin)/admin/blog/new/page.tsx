import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { BlogPostForm } from "../BlogPostForm";

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

export default async function NewBlogPostPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Novo Post
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Criar novo artigo para o blog
        </p>
      </div>

      <BlogPostForm categories={categories} />
    </div>
  );
}
