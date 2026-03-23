import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const metadata = {
  title: "Notificações | VibeTuga",
};

const TYPE_ICONS: Record<string, string> = {
  new_follower: "👤",
  comment_reply: "💬",
  post_approved: "✅",
  xp_milestone: "⭐",
  badge_earned: "🏆",
  post_liked: "❤️",
  project_featured: "🚀",
};

function relativeTime(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `há ${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const [items, [unreadResult], [totalResult]] = await Promise.all([
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        link: notifications.link,
        isRead: notifications.isRead,
        actorId: notifications.actorId,
        referenceId: notifications.referenceId,
        createdAt: notifications.createdAt,
        actorDisplayName: users.displayName,
        actorImage: users.image,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false))),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(eq(notifications.userId, session.user.id)),
  ]);

  const unreadCount = unreadResult.count;
  const totalCount = totalResult.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Notificações</h1>
          <p className="text-sm text-white/40 font-mono mt-1">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo lido"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">🔔</span>
          <p className="text-white/40 text-sm">Sem notificações de momento.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((n) => {
            const inner = (
              <div
                className={`flex items-start gap-4 px-4 py-3.5 rounded-lg transition-colors hover:bg-white/[0.03] ${!n.isRead ? "bg-primary/[0.04] border border-primary/10" : "border border-transparent"}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {n.actorImage ? (
                    <Image
                      src={n.actorImage}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-base">
                      {TYPE_ICONS[n.type] ?? "🔔"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${!n.isRead ? "text-white font-medium" : "text-white/60"}`}
                  >
                    {n.actorDisplayName && (
                      <span className="text-primary/90">{n.actorDisplayName} </span>
                    )}
                    {n.title}
                  </p>
                  {n.body && <p className="text-xs text-white/35 mt-0.5 line-clamp-2">{n.body}</p>}
                  <span className="text-[10px] text-white/20 font-mono mt-1.5 block">
                    {relativeTime(n.createdAt)}
                  </span>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(161,255,194,0.5)]" />
                  </div>
                )}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          {page > 1 && (
            <Link
              href={`/dashboard/notifications?page=${page - 1}`}
              className="px-3 py-1.5 text-xs font-mono text-white/50 border border-white/10 rounded hover:text-primary hover:border-primary/30 transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="text-xs font-mono text-white/30">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/notifications?page=${page + 1}`}
              className="px-3 py-1.5 text-xs font-mono text-white/50 border border-white/10 rounded hover:text-primary hover:border-primary/30 transition-colors"
            >
              Seguinte
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
