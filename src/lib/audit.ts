import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";

interface AuditLogParams {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string | null;
}

/**
 * Log an admin/moderator action to the audit log.
 * Fire-and-forget — errors are caught silently to avoid blocking the response.
 */
export async function logAdminAction({
  actorId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: AuditLogParams): Promise<void> {
  try {
    const detailsStr =
      details == null ? null : typeof details === "string" ? details : JSON.stringify(details);

    await db.insert(adminAuditLog).values({
      actorId,
      action,
      targetType,
      targetId,
      details: detailsStr,
      ipAddress: ipAddress ?? null,
    });
  } catch {
    // Silently fail — audit logging should never block the main action
  }
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? null;
}
