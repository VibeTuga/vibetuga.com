import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT_PER_MINUTE || "100", 10);

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(keyId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(keyId);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(keyId, { count: 1, resetAt });
    return { allowed: true, remaining: DEFAULT_RATE_LIMIT - 1, resetAt };
  }

  if (entry.count >= DEFAULT_RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: DEFAULT_RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export type ApiV1Context = {
  userId: string;
  keyId: string;
  scopes: string[];
  user: {
    id: string;
    discordUsername: string;
    displayName: string | null;
    role: string;
  };
};

export function apiV1Error(message: string, status: number) {
  return NextResponse.json(
    { error: message, meta: { apiVersion: "v1" } },
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function withApiV1Auth(request: Request): Promise<ApiV1Context | NextResponse> {
  // Extract API key from Authorization header or x-api-key header
  let rawKey: string | null = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    rawKey = authHeader.slice(7);
  }

  if (!rawKey) {
    rawKey = request.headers.get("x-api-key");
  }

  if (!rawKey) {
    return apiV1Error(
      "Missing API key. Provide via Authorization: Bearer <key> or x-api-key header.",
      401,
    );
  }

  // Validate the key
  const keyData = await validateApiKey(rawKey);
  if (!keyData) {
    return apiV1Error("Invalid or expired API key.", 401);
  }

  // Rate limiting
  const rateResult = checkRateLimit(keyData.id);
  if (!rateResult.allowed) {
    const retryAfter = Math.ceil((rateResult.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", meta: { apiVersion: "v1" } },
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(DEFAULT_RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateResult.resetAt / 1000)),
        },
      },
    );
  }

  // Fetch user context
  const [user] = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, keyData.userId))
    .limit(1);

  if (!user) {
    return apiV1Error("API key owner not found.", 401);
  }

  return {
    userId: keyData.userId,
    keyId: keyData.id,
    scopes: keyData.scopes ?? [],
    user,
  };
}

export function apiV1Response<T>(
  data: T,
  pagination?: { page: number; limit: number; total: number },
) {
  const body: Record<string, unknown> = {
    data,
    meta: { apiVersion: "v1" },
  };

  if (pagination) {
    body.pagination = pagination;
  }

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "X-RateLimit-Limit": String(DEFAULT_RATE_LIMIT),
    },
  });
}
