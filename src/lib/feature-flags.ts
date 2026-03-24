import { db } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

// ─── In-memory cache ──────────────────────────────────────

interface CachedFlags {
  data: Map<string, { isEnabled: boolean; rolloutPercentage: number }>;
  timestamp: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds
let flagsCache: CachedFlags | null = null;

async function loadFlags(): Promise<CachedFlags["data"]> {
  const now = Date.now();

  if (flagsCache && now - flagsCache.timestamp < CACHE_TTL_MS) {
    return flagsCache.data;
  }

  const rows = await db.select().from(featureFlags);
  const data = new Map(
    rows.map((r) => [r.key, { isEnabled: r.isEnabled, rolloutPercentage: r.rolloutPercentage }]),
  );

  flagsCache = { data, timestamp: now };
  return data;
}

/** Invalidate the in-memory cache (call after mutations). */
export function invalidateFlagCache(): void {
  flagsCache = null;
}

// ─── Deterministic hash for rollout ───────────────────────

function hashToPercentage(key: string, seed: string = ""): number {
  const hash = createHash("sha256").update(`${key}:${seed}`).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16);
  return num % 100;
}

// ─── Public API ───────────────────────────────────────────

/**
 * Check if a feature flag is enabled.
 * Uses in-memory cache (60s TTL) to avoid excessive DB queries.
 * When rolloutPercentage < 100, uses a deterministic hash of the key
 * (optionally combined with a userId seed) to decide.
 */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const flags = await loadFlags();
  const flag = flags.get(key);

  if (!flag) return false;
  if (!flag.isEnabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (flag.rolloutPercentage <= 0) return false;

  const bucket = hashToPercentage(key, userId ?? "");
  return bucket < flag.rolloutPercentage;
}

/**
 * Get all feature flags from the database.
 */
export async function getFeatureFlags() {
  return db.select().from(featureFlags).orderBy(featureFlags.key);
}

/**
 * Get a single feature flag by ID.
 */
export async function getFeatureFlagById(id: string) {
  const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.id, id)).limit(1);
  return flag ?? null;
}
