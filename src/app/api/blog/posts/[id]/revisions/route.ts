import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogRevisions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "author"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const revisions = await db
      .select({
        id: blogRevisions.id,
        title: blogRevisions.title,
        content: blogRevisions.content,
        revisionNumber: blogRevisions.revisionNumber,
        createdAt: blogRevisions.createdAt,
        editedBy: blogRevisions.editedBy,
        editorName: users.displayName,
        editorUsername: users.discordUsername,
      })
      .from(blogRevisions)
      .leftJoin(users, eq(blogRevisions.editedBy, users.id))
      .where(eq(blogRevisions.postId, id))
      .orderBy(desc(blogRevisions.revisionNumber));

    return NextResponse.json(revisions);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar revisões" }, { status: 500 });
  }
}
