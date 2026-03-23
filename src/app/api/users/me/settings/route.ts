import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const VALID_PRIVACY_LEVELS = ["public", "members", "private"] as const;
const VALID_LOCALES = ["pt", "en"] as const;

type PrivacyLevel = (typeof VALID_PRIVACY_LEVELS)[number];
type Locale = (typeof VALID_LOCALES)[number];

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  inAppNotifications: true,
  privacyLevel: "public" as PrivacyLevel,
  locale: "pt" as Locale,
};

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const [settings] = await db
      .select({
        emailNotifications: userSettings.emailNotifications,
        inAppNotifications: userSettings.inAppNotifications,
        privacyLevel: userSettings.privacyLevel,
        locale: userSettings.locale,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    return NextResponse.json(settings ?? DEFAULT_SETTINGS);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar definições" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updates: Record<string, boolean | string> = {};

    if (body.emailNotifications !== undefined) {
      if (typeof body.emailNotifications !== "boolean") {
        return NextResponse.json({ error: "emailNotifications deve ser boolean" }, { status: 400 });
      }
      updates.emailNotifications = body.emailNotifications;
    }

    if (body.inAppNotifications !== undefined) {
      if (typeof body.inAppNotifications !== "boolean") {
        return NextResponse.json({ error: "inAppNotifications deve ser boolean" }, { status: 400 });
      }
      updates.inAppNotifications = body.inAppNotifications;
    }

    if (body.privacyLevel !== undefined) {
      if (!VALID_PRIVACY_LEVELS.includes(body.privacyLevel)) {
        return NextResponse.json(
          { error: "privacyLevel deve ser 'public', 'members' ou 'private'" },
          { status: 400 },
        );
      }
      updates.privacyLevel = body.privacyLevel;
    }

    if (body.locale !== undefined) {
      if (!VALID_LOCALES.includes(body.locale)) {
        return NextResponse.json({ error: "locale deve ser 'pt' ou 'en'" }, { status: 400 });
      }
      updates.locale = body.locale;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    // Upsert: insert if not exists, update if exists
    const [existing] = await db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (existing) {
      await db
        .update(userSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userSettings.userId, session.user.id));
    } else {
      await db.insert(userSettings).values({
        userId: session.user.id,
        ...DEFAULT_SETTINGS,
        ...updates,
      });
    }

    // Return updated settings
    const [result] = await db
      .select({
        emailNotifications: userSettings.emailNotifications,
        inAppNotifications: userSettings.inAppNotifications,
        privacyLevel: userSettings.privacyLevel,
        locale: userSettings.locale,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar definições" }, { status: 500 });
  }
}
