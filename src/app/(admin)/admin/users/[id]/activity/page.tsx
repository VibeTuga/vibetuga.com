import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  blogComments,
  showcaseProjects,
  storeProducts,
  storePurchases,
  xpEvents,
  reports,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Rocket,
  ShoppingBag,
  Zap,
  Flag,
  CreditCard,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await db
    .select({ discordUsername: users.discordUsername, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  const name = user?.displayName || user?.discordUsername || "Utilizador";
  return {
    title: `Atividade de ${name} | Admin | VibeTuga`,
  };
}

type TimelineItem = {
  id: string;
  type:
    | "xp"
    | "post"
    | "comment"
    | "project"
    | "product"
    | "purchase"
    | "report_filed"
    | "report_against";
  title: string;
  detail?: string | null;
  status?: string | null;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  pending_review: "bg-amber-500/20 text-amber-400",
  published: "bg-green-500/20 text-green-400",
  archived: "bg-white/10 text-white/50",
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-green-500/20 text-green-400",
  featured: "bg-primary/20 text-primary",
  rejected: "bg-red-500/20 text-red-400",
};

const TYPE_ICONS: Record<string, { icon: typeof Zap; color: string }> = {
  xp: { icon: Zap, color: "text-primary" },
  post: { icon: FileText, color: "text-blue-400" },
  comment: { icon: MessageSquare, color: "text-cyan-400" },
  project: { icon: Rocket, color: "text-purple-400" },
  product: { icon: ShoppingBag, color: "text-amber-400" },
  purchase: { icon: CreditCard, color: "text-green-400" },
  report_filed: { icon: Flag, color: "text-red-400" },
  report_against: { icon: Flag, color: "text-orange-400" },
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UserActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [user] = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      image: users.image,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      isBanned: users.isBanned,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    notFound();
  }

  const name = user.displayName || user.discordUsername;

  // Fetch all activity data in parallel
  const [
    userXpEvents,
    userPosts,
    userComments,
    userProjects,
    userProducts,
    userPurchases,
    reportsBy,
    _reportsAgainst,
  ] = await Promise.all([
    db
      .select({
        id: xpEvents.id,
        action: xpEvents.action,
        xpAmount: xpEvents.xpAmount,
        createdAt: xpEvents.createdAt,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, id))
      .orderBy(desc(xpEvents.createdAt))
      .limit(50),
    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        status: blogPosts.status,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, id))
      .orderBy(desc(blogPosts.createdAt)),
    db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
      })
      .from(blogComments)
      .where(eq(blogComments.authorId, id))
      .orderBy(desc(blogComments.createdAt))
      .limit(50),
    db
      .select({
        id: showcaseProjects.id,
        title: showcaseProjects.title,
        status: showcaseProjects.status,
        createdAt: showcaseProjects.createdAt,
      })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.authorId, id))
      .orderBy(desc(showcaseProjects.createdAt)),
    db
      .select({
        id: storeProducts.id,
        title: storeProducts.title,
        status: storeProducts.status,
        createdAt: storeProducts.createdAt,
      })
      .from(storeProducts)
      .where(eq(storeProducts.sellerId, id))
      .orderBy(desc(storeProducts.createdAt)),
    db
      .select({
        id: storePurchases.id,
        pricePaidCents: storePurchases.pricePaidCents,
        createdAt: storePurchases.createdAt,
      })
      .from(storePurchases)
      .where(eq(storePurchases.buyerId, id))
      .orderBy(desc(storePurchases.createdAt))
      .limit(50),
    db
      .select({
        id: reports.id,
        contentType: reports.contentType,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(eq(reports.reporterId, id))
      .orderBy(desc(reports.createdAt)),
    db
      .select({
        id: reports.id,
        contentType: reports.contentType,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(eq(reports.contentType, "user"))
      .orderBy(desc(reports.createdAt)),
  ]);

  // Build unified timeline
  const timeline: TimelineItem[] = [];

  for (const ev of userXpEvents) {
    timeline.push({
      id: ev.id,
      type: "xp",
      title: `+${ev.xpAmount} XP`,
      detail: ev.action.replace(/_/g, " "),
      createdAt: ev.createdAt,
    });
  }

  for (const post of userPosts) {
    timeline.push({
      id: post.id,
      type: "post",
      title: post.title,
      status: post.status,
      createdAt: post.createdAt,
    });
  }

  for (const comment of userComments) {
    timeline.push({
      id: comment.id,
      type: "comment",
      title: comment.content.slice(0, 100) + (comment.content.length > 100 ? "..." : ""),
      createdAt: comment.createdAt,
    });
  }

  for (const project of userProjects) {
    timeline.push({
      id: project.id,
      type: "project",
      title: project.title,
      status: project.status,
      createdAt: project.createdAt,
    });
  }

  for (const product of userProducts) {
    timeline.push({
      id: product.id,
      type: "product",
      title: product.title,
      status: product.status,
      createdAt: product.createdAt,
    });
  }

  for (const purchase of userPurchases) {
    timeline.push({
      id: purchase.id,
      type: "purchase",
      title: `Compra: €${(purchase.pricePaidCents / 100).toFixed(2)}`,
      createdAt: purchase.createdAt,
    });
  }

  for (const report of reportsBy) {
    timeline.push({
      id: report.id,
      type: "report_filed",
      title: `Denúncia (${report.contentType})`,
      detail: report.reason,
      status: report.status,
      createdAt: report.createdAt,
    });
  }

  // Sort by date descending
  timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-xs font-mono text-white/40 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar aos Utilizadores
        </Link>

        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-lg font-bold text-white/50 border-2 border-primary/30">
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
              {name}
            </h1>
            <p className="text-[10px] font-mono text-white/40 mt-0.5">
              @{user.discordUsername} &middot; {user.role.toUpperCase()} &middot; LVL {user.level}{" "}
              &middot; {user.xpPoints.toLocaleString("pt-PT")} XP
              {user.isBanned && <span className="text-red-400 ml-2">BANIDO</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: "Posts", value: userPosts.length },
          { label: "Comentários", value: userComments.length },
          { label: "Projetos", value: userProjects.length },
          { label: "Produtos", value: userProducts.length },
          { label: "Compras", value: userPurchases.length },
          { label: "Denúncias", value: reportsBy.length },
          { label: "Eventos XP", value: userXpEvents.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-3 text-center">
            <p className="font-mono text-lg font-bold text-primary">{stat.value}</p>
            <p className="text-[9px] font-mono text-white/30 uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        <h2 className="font-label text-[10px] text-white/30 uppercase tracking-[0.15em] px-4 py-2">
          Timeline de Atividade ({timeline.length} eventos)
        </h2>

        {timeline.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-mono text-sm text-white/30">
              Nenhuma atividade registada para este utilizador.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {timeline.map((item) => {
              const typeInfo = TYPE_ICONS[item.type] ?? TYPE_ICONS.xp;
              const Icon = typeInfo.icon;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-start gap-3 bg-surface-container-low hover:bg-surface-container transition-colors px-4 py-3"
                >
                  <div className={`mt-0.5 ${typeInfo.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.detail && (
                        <span className="text-[10px] font-mono text-white/30">{item.detail}</span>
                      )}
                      {item.status && (
                        <span
                          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase ${STATUS_STYLES[item.status] ?? "bg-white/10 text-white/50"}`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/20 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
