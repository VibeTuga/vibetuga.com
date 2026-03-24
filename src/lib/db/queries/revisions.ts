import { db } from "@/lib/db";
import { blogRevisions, blogPosts, users } from "@/lib/db/schema";
import { eq, desc, max, sql } from "drizzle-orm";

export async function createRevision(
  postId: string,
  title: string,
  content: string,
  editedBy: string,
) {
  // Get the max revision number for this post
  const [result] = await db
    .select({ maxNum: max(blogRevisions.revisionNumber) })
    .from(blogRevisions)
    .where(eq(blogRevisions.postId, postId));

  const nextNumber = (result?.maxNum ?? 0) + 1;

  const [revision] = await db
    .insert(blogRevisions)
    .values({
      postId,
      title,
      content,
      editedBy,
      revisionNumber: nextNumber,
    })
    .returning();

  return revision;
}

export async function getRevisions(postId: string) {
  return db
    .select({
      id: blogRevisions.id,
      postId: blogRevisions.postId,
      title: blogRevisions.title,
      content: blogRevisions.content,
      revisionNumber: blogRevisions.revisionNumber,
      createdAt: blogRevisions.createdAt,
      editedBy: blogRevisions.editedBy,
      editorName: sql<string | null>`coalesce(${users.displayName}, ${users.discordUsername})`,
    })
    .from(blogRevisions)
    .leftJoin(users, eq(blogRevisions.editedBy, users.id))
    .where(eq(blogRevisions.postId, postId))
    .orderBy(desc(blogRevisions.revisionNumber));
}

export async function getRevision(revisionId: number) {
  const [revision] = await db
    .select({
      id: blogRevisions.id,
      postId: blogRevisions.postId,
      title: blogRevisions.title,
      content: blogRevisions.content,
      revisionNumber: blogRevisions.revisionNumber,
      createdAt: blogRevisions.createdAt,
      editedBy: blogRevisions.editedBy,
      editorName: sql<string | null>`coalesce(${users.displayName}, ${users.discordUsername})`,
    })
    .from(blogRevisions)
    .leftJoin(users, eq(blogRevisions.editedBy, users.id))
    .where(eq(blogRevisions.id, revisionId))
    .limit(1);

  return revision ?? null;
}

export async function restoreRevision(postId: string, revisionId: number, restoredBy: string) {
  // Get the revision to restore
  const revision = await getRevision(revisionId);
  if (!revision || revision.postId !== postId) {
    return null;
  }

  // Create a new revision from the old one (marks the restore point)
  const newRevision = await createRevision(postId, revision.title, revision.content, restoredBy);

  // Update the post content to match the restored revision
  await db
    .update(blogPosts)
    .set({
      title: revision.title,
      content: revision.content,
      readingTimeMinutes: Math.max(1, Math.ceil(revision.content.split(/\s+/).length / 200)),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  return newRevision;
}
