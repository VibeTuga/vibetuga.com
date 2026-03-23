import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({
        displayName: users.displayName,
        bio: users.bio,
        websiteUrl: users.websiteUrl,
        email: users.email,
        discordUsername: users.discordUsername,
        image: users.image,
        role: users.role,
        xpPoints: users.xpPoints,
        level: users.level,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, string> = {};

    if (body.displayName !== undefined) {
      const displayName = String(body.displayName).trim();
      if (displayName.length > 50) {
        return NextResponse.json(
          { error: "O nome de exibição não pode ter mais de 50 caracteres" },
          { status: 400 },
        );
      }
      updates.displayName = displayName;
    }

    if (body.bio !== undefined) {
      const bio = String(body.bio).trim();
      if (bio.length > 500) {
        return NextResponse.json(
          { error: "A bio não pode ter mais de 500 caracteres" },
          { status: 400 },
        );
      }
      updates.bio = bio;
    }

    if (body.websiteUrl !== undefined) {
      const websiteUrl = String(body.websiteUrl).trim();
      if (websiteUrl.length > 200) {
        return NextResponse.json(
          { error: "O URL do website não pode ter mais de 200 caracteres" },
          { status: 400 },
        );
      }
      updates.websiteUrl = websiteUrl;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
