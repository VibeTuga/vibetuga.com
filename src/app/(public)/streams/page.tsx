import type { Metadata } from "next";
import { Video, Clock, ExternalLink, PlayCircle } from "lucide-react";
import { getLiveAndUpcomingStreams, getPastStreams } from "@/lib/db/queries/streams";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Streams | VibeTuga",
  description: "Assiste às streams ao vivo e VODs da comunidade VibeTuga no Twitch e YouTube.",
  openGraph: {
    title: "Streams | VibeTuga",
    description: "Assiste às streams ao vivo e VODs da comunidade VibeTuga no Twitch e YouTube.",
    type: "website",
  },
  alternates: {
    canonical: "https://vibetuga.com/streams",
  },
};

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
    </svg>
  );
}

const PLATFORM_CONFIG = {
  twitch: {
    label: "Twitch",
    icon: TwitchIcon,
    color: "text-purple-400",
    bg: "bg-purple-500/15 border-purple-500/30",
    buttonBg: "bg-purple-600 hover:bg-purple-500",
    baseUrl: "https://twitch.tv/",
  },
  youtube: {
    label: "YouTube",
    icon: YouTubeIcon,
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/30",
    buttonBg: "bg-red-600 hover:bg-red-500",
    baseUrl: "https://youtube.com/",
  },
} as const;

function formatStreamDate(date: Date): string {
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatStreamTime(date: Date): string {
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountdownText(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return "A começar...";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `em ${days}d ${hours}h`;
  if (hours > 0) return `em ${hours}h ${minutes}m`;
  return `em ${minutes}m`;
}

export default async function StreamsPage() {
  const [liveAndUpcoming, past] = await Promise.all([
    getLiveAndUpcomingStreams(),
    getPastStreams(10),
  ]);

  const liveStreams = liveAndUpcoming.filter((s) => s.isLive);
  const upcoming = liveAndUpcoming.filter((s) => !s.isLive);
  const pastStreams = past.filter((s) => !s.isLive);

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Video className="text-primary" size={28} />
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Streams</h1>
          </div>
          <p className="text-white/50 max-w-2xl">
            Acompanha as nossas streams ao vivo no Twitch e YouTube. Vibe coding, tutoriais e builds
            ao vivo!
          </p>
        </div>

        {/* Currently Live */}
        {liveStreams.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-mono uppercase text-red-400 tracking-widest mb-6 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              Ao Vivo Agora
            </h2>
            <div className="space-y-4">
              {liveStreams.map((stream) => {
                const config = PLATFORM_CONFIG[stream.platform];
                const PlatformIcon = config.icon;
                return (
                  <div
                    key={stream.id}
                    className="relative bg-surface-container-low/80 backdrop-blur-md border border-red-500/20 rounded-lg p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase rounded-full border ${config.bg} ${config.color}`}
                          >
                            <PlatformIcon className={config.color} />
                            {config.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            AO VIVO
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-headline font-bold text-white mb-2">
                          {stream.title}
                        </h3>
                        {stream.description && (
                          <p className="text-sm text-white/40 line-clamp-2 mb-4">
                            {stream.description}
                          </p>
                        )}
                        {stream.creatorDisplayName && (
                          <p className="text-xs font-mono text-white/30">
                            por {stream.creatorDisplayName}
                          </p>
                        )}
                      </div>
                      <a
                        href="/streams"
                        className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 ${config.buttonBg} text-white font-headline font-bold text-sm uppercase rounded transition-colors`}
                      >
                        <ExternalLink size={16} />
                        Assistir Agora
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Streams */}
        {upcoming.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-6">
              Próximas Streams
            </h2>
            <div className="space-y-4">
              {upcoming.map((stream) => {
                const config = PLATFORM_CONFIG[stream.platform];
                const PlatformIcon = config.icon;
                return (
                  <div
                    key={stream.id}
                    className="relative block bg-surface-container-low border border-primary/10 rounded-lg p-6 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date column */}
                      <div className="shrink-0 flex md:flex-col items-center md:items-center gap-2 md:gap-0 md:w-20 md:text-center">
                        <span className="text-3xl font-headline font-black text-primary">
                          {stream.scheduledAt.getDate()}
                        </span>
                        <span className="text-xs font-mono uppercase text-white/40">
                          {stream.scheduledAt.toLocaleDateString("pt-PT", { month: "short" })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full border ${config.bg} ${config.color}`}
                          >
                            <PlatformIcon className={config.color} />
                            {config.label}
                          </span>
                          <span className="text-[10px] font-mono text-white/30 uppercase">
                            {getCountdownText(stream.scheduledAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-headline font-bold text-white group-hover:text-primary transition-colors mb-1">
                          {stream.title}
                        </h3>
                        {stream.description && (
                          <p className="text-sm text-white/40 line-clamp-2 mb-3">
                            {stream.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/30">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatStreamDate(stream.scheduledAt)} às{" "}
                            {formatStreamTime(stream.scheduledAt)}
                          </span>
                          {stream.duration && (
                            <span className="text-white/20">~{stream.duration} min</span>
                          )}
                          {stream.creatorDisplayName && (
                            <span className="text-white/20">por {stream.creatorDisplayName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {liveStreams.length === 0 && upcoming.length === 0 && pastStreams.length === 0 && (
          <div className="text-center py-20">
            <Video size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 font-mono text-sm">
              Nenhuma stream agendada de momento. Volta em breve!
            </p>
          </div>
        )}

        {/* No live/upcoming but has past */}
        {liveStreams.length === 0 && upcoming.length === 0 && pastStreams.length > 0 && (
          <div className="text-center py-12 mb-12">
            <Video size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 font-mono text-sm">Nenhuma stream agendada de momento.</p>
          </div>
        )}

        {/* Past Streams / VODs */}
        {pastStreams.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase text-white/30 tracking-widest mb-6">
              Streams Anteriores
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastStreams.map((stream) => {
                const config = PLATFORM_CONFIG[stream.platform];
                const PlatformIcon = config.icon;
                const Wrapper = stream.vodUrl ? "a" : "div";
                const wrapperProps = stream.vodUrl
                  ? {
                      href: stream.vodUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {};

                return (
                  <Wrapper
                    key={stream.id}
                    {...wrapperProps}
                    className="block bg-surface-container-lowest border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded-full border ${config.bg} ${config.color} opacity-60`}
                      >
                        <PlatformIcon className={config.color} />
                        {config.label}
                      </span>
                      {stream.vodUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded-full bg-white/5 text-white/40 border border-white/10">
                          <PlayCircle size={10} />
                          VOD
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline font-semibold text-white/70 mb-1">
                      {stream.title}
                    </h3>
                    {stream.description && (
                      <p className="text-xs text-white/30 line-clamp-1 mb-2">
                        {stream.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-white/20">
                      <Clock size={12} />
                      {formatStreamDate(stream.scheduledAt)}
                      {stream.duration && <span> — {stream.duration} min</span>}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
