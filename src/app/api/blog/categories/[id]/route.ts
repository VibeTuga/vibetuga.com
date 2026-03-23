import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, color, icon, sortOrder } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [category] = await db
      .update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, id))
      .returning();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(blogCategories)
      .where(eq(blogCategories.id, id))
      .returning({ id: blogCategories.id });

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
