import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, scopes, expiresAt } = body as {
      name?: string;
      scopes?: string[];
      expiresAt?: string;
    };

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Nome muito longo (máx. 100 caracteres)" },
        { status: 400 },
      );
    }

    const validScopes = ["leaderboard:read", "users:read", "projects:read", "search:read"];
    const requestedScopes = scopes ?? validScopes;
    const invalidScopes = requestedScopes.filter((s) => !validScopes.includes(s));
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: `Scopes inválidos: ${invalidScopes.join(", ")}` },
        { status: 400 },
      );
    }

    // Generate raw key and hash
    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    const [created] = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        keyHash,
        name: name.trim(),
        scopes: requestedScopes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        scopes: apiKeys.scopes,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      });

    // Return the raw key ONCE — it cannot be retrieved again
    return NextResponse.json({ key: rawKey, ...created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar chave API" }, { status: 500 });
  }
}
