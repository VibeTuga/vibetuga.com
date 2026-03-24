import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCollections } from "@/lib/db/schema";
import { getAllCollections } from "@/lib/db/queries/store";

export async function GET() {
  const collections = await getAllCollections();
  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = session.user as { id: string; role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, description, coverImage, isFeatured, sortOrder } = body;

  if (!name || typeof name !== "string" || name.length > 200) {
    return NextResponse.json({ error: "Nome inválido (máx. 200 chars)." }, { status: 400 });
  }

  if (!slug || typeof slug !== "string" || slug.length > 200) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }

  const [collection] = await db
    .insert(storeCollections)
    .values({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      coverImage: coverImage || null,
      isFeatured: !!isFeatured,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    })
    .returning();

  return NextResponse.json(collection, { status: 201 });
}
