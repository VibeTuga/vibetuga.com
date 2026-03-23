import { getRelatedPosts } from "@/lib/db/queries/blog";
import { BlogCard } from "./BlogCard";

type RelatedPostsProps = {
  postId: string;
  tags: string[] | null;
  categoryId: string | null;
};

export async function RelatedPosts({ postId, tags, categoryId }: RelatedPostsProps) {
  const posts = await getRelatedPosts(postId, tags, categoryId, 3);

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-white/5 pt-10 mt-10">
      <h2 className="font-headline text-2xl font-bold text-white tracking-tight mb-8">
        Artigos Relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
