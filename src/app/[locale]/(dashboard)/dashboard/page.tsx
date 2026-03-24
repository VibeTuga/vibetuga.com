import { redirect } from "next/navigation";
import { Link } from "@/lib/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import {
  getUserDashboardActivity,
  getXpActionLabel,
  type DashboardXpEvent,
  type DashboardComment,
} from "@/lib/db/queries/dashboard";
import { XpProgressBar } from "@/components/profile/XpProgressBar";
import {
  Zap,
  MessageSquare,
  Trophy,
  Flame,
  Star,
  FileText,
  Layers,
  ShoppingBag,
  ArrowUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | VibeTuga",
};

// ─── helpers ────────────────────────────────────────────────

function getXpActionIcon(action: string) {
  switch (action) {
    case "blog_post_published":
      return <FileText size={14} className="text-blue-400" />;
    case "blog_comment":
      return <MessageSquare size={14} className="text-cyan-400" />;
    case "project_submitted":
      return <Layers size={14} className="text-purple-400" />;
    case "project_featured":
      return <Star size={14} className="text-yellow-400" />;
    case "product_sold":
      return <ShoppingBag size={14} className="text-green-400" />;
    case "product_reviewed":
      return <Star size={14} className="text-amber-400" />;
    case "streak_7_days":
    case "streak_30_days":
      return <Flame size={14} className="text-orange-400" />;
    default:
      return <Zap size={14} className="text-primary" />;
  }
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

// ─── sub-components ─────────────────────────────────────────

function XpEventRow({ event }: { event: DashboardXpEvent }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center">
        {getXpActionIcon(event.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">{getXpActionLabel(event.action)}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-mono text-primary whitespace-nowrap">
        <ArrowUp size={10} />+{event.xpAmount} XP
      </span>
      <span className="text-[10px] font-mono text-white/30 whitespace-nowrap">
        {relativeTime(event.createdAt)}
      </span>
    </div>
  );
}

function CommentRow({ comment }: { comment: DashboardComment }) {
  const name = comment.commenterName ?? comment.commenterDiscordUsername;
  const excerpt =
    comment.commentContent.length > 120
      ? `${comment.commentContent.slice(0, 120)}…`
      : comment.commentContent;

  return (
    <Link
      href={`/blog/${comment.postSlug}`}
      className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0 hover:bg-surface-container-high/50 transition-colors -mx-2 px-2 rounded"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-container-highest overflow-hidden">
        {comment.commenterImage ? (
          <Image
            src={comment.commenterImage}
            alt={name}
            width={28}
            height={28}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-white/50 uppercase">
            {(name ?? "?").charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50">
          <span className="text-white/80 font-medium">{name}</span>
          {" comentou em "}
          <span className="text-primary/80">{comment.postTitle}</span>
        </p>
        <p className="text-sm text-white/60 mt-0.5 truncate">{excerpt}</p>
      </div>
      <span className="text-[10px] font-mono text-white/30 whitespace-nowrap mt-0.5">
        {relativeTime(comment.commentCreatedAt)}
      </span>
    </Link>
  );
}

// ─── page ───────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getUserDashboardActivity(session.user.id);
  if (!data) redirect("/login");

  const { user, levelName, currentLevelXp, nextLevelXp, recentXpEvents, recentCommentsOnPosts } =
    data;

  // XP progress percentage
  const progressPct =
    nextLevelXp !== null
      ? Math.min(
          100,
          Math.round(((user.xpPoints - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100),
        )
      : 100;

  const displayName = user.displayName ?? user.discordUsername;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-surface-container-low rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-primary/30 flex items-center justify-center text-lg font-mono text-primary uppercase">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-white">Olá, {displayName}</h1>
            <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
              LVL {user.level} — {levelName}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Zap size={14} />
              <span className="text-sm font-mono font-bold">
                {user.xpPoints.toLocaleString("pt-PT")}
              </span>
            </div>
            <p className="text-[10px] font-mono text-white/30 uppercase">XP Total</p>
          </div>
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-secondary mb-1">
              <Trophy size={14} />
              <span className="text-sm font-mono font-bold">{user.level}</span>
            </div>
            <p className="text-[10px] font-mono text-white/30 uppercase">Nível</p>
          </div>
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Flame size={14} />
              <span className="text-sm font-mono font-bold">{user.streakDays}</span>
            </div>
            <p className="text-[10px] font-mono text-white/30 uppercase">Streak</p>
          </div>
        </div>

        {/* XP Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-white/30 mb-1">
            <span>LVL {user.level}</span>
            {nextLevelXp !== null ? (
              <span>
                {user.xpPoints.toLocaleString("pt-PT")} / {nextLevelXp.toLocaleString("pt-PT")} XP
              </span>
            ) : (
              <span>MAX</span>
            )}
          </div>
          <XpProgressBar progressPct={progressPct} />
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          Atividade Recente
        </h2>
        {recentXpEvents.length > 0 ? (
          <div className="bg-surface-container-low rounded-lg p-4">
            {recentXpEvents.map((event) => (
              <XpEventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-lg p-8 text-center">
            <Zap size={24} className="mx-auto text-white/10 mb-2" />
            <p className="text-sm text-white/30">Ainda sem atividade. Começa a explorar!</p>
          </div>
        )}
      </div>

      {/* Recent comments on user's posts */}
      <div>
        <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MessageSquare size={14} className="text-cyan-400" />
          Comentários nos Teus Posts
        </h2>
        {recentCommentsOnPosts.length > 0 ? (
          <div className="bg-surface-container-low rounded-lg p-4">
            {recentCommentsOnPosts.map((comment) => (
              <CommentRow key={comment.commentId} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-lg p-8 text-center">
            <MessageSquare size={24} className="mx-auto text-white/10 mb-2" />
            <p className="text-sm text-white/30">Sem comentários recentes nos teus posts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
