import type { Metadata } from "next";
import {
  Calendar,
  Clock,
  ExternalLink,
  Radio,
  BookOpen,
  Trophy,
  Users,
  Sparkles,
} from "lucide-react";
import { getUpcomingEvents, getPastEvents } from "@/lib/db/queries/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos | VibeTuga",
  description:
    "Descobre os próximos eventos da comunidade VibeTuga — streams, workshops, desafios e meetups.",
  openGraph: {
    title: "Eventos | VibeTuga",
    description:
      "Descobre os próximos eventos da comunidade VibeTuga — streams, workshops, desafios e meetups.",
    type: "website",
  },
  alternates: {
    canonical: "https://vibetuga.com/events",
  },
};

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Calendar }
> = {
  stream: {
    label: "Stream",
    className: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    icon: Radio,
  },
  workshop: {
    label: "Workshop",
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    icon: BookOpen,
  },
  challenge: {
    label: "Desafio",
    className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    icon: Trophy,
  },
  meetup: {
    label: "Meetup",
    className: "bg-green-500/20 text-green-400 border border-green-500/30",
    icon: Users,
  },
  other: {
    label: "Outro",
    className: "bg-white/10 text-white/50 border border-white/10",
    icon: Sparkles,
  },
};

function formatEventDate(date: Date): string {
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(date: Date): string {
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const [upcoming, pastResult] = await Promise.all([getUpcomingEvents(20), getPastEvents(12, 0)]);

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={28} />
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Eventos</h1>
          </div>
          <p className="text-white/50 max-w-2xl">
            Streams, workshops, desafios e meetups da comunidade VibeTuga. Não percas nada!
          </p>
        </div>

        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-6">
              Próximos Eventos
            </h2>
            <div className="space-y-4">
              {upcoming.map((event) => {
                const config = EVENT_TYPE_CONFIG[event.eventType] ?? EVENT_TYPE_CONFIG.other;
                const TypeIcon = config.icon;
                return (
                  <div
                    key={event.id}
                    className="relative bg-surface-container-low border border-primary/10 rounded-lg p-6 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date column */}
                      <div className="shrink-0 flex md:flex-col items-center md:items-center gap-2 md:gap-0 md:w-20 md:text-center">
                        <span className="text-3xl font-headline font-black text-primary">
                          {event.startAt.getDate()}
                        </span>
                        <span className="text-xs font-mono uppercase text-white/40">
                          {event.startAt.toLocaleDateString("pt-PT", { month: "short" })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full ${config.className}`}
                          >
                            <TypeIcon size={12} />
                            {config.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-headline font-bold text-white group-hover:text-primary transition-colors mb-1">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-white/40 line-clamp-2 mb-3">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/30">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatEventDate(event.startAt)} às {formatEventTime(event.startAt)}
                          </span>
                          {event.endAt && (
                            <span className="text-white/20">
                              — até {formatEventTime(event.endAt)}
                            </span>
                          )}
                          {event.creatorDisplayName && (
                            <span className="text-white/20">por {event.creatorDisplayName}</span>
                          )}
                        </div>
                      </div>

                      {/* Link */}
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase hover:bg-primary/20 transition-colors rounded"
                        >
                          <ExternalLink size={14} />
                          Participar
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {upcoming.length === 0 && pastResult.events.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 font-mono text-sm">
              Nenhum evento disponível de momento. Volta em breve!
            </p>
          </div>
        )}

        {/* No upcoming but has past */}
        {upcoming.length === 0 && pastResult.events.length > 0 && (
          <div className="text-center py-12 mb-12">
            <Calendar size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 font-mono text-sm">Nenhum evento agendado de momento.</p>
          </div>
        )}

        {/* Past events */}
        {pastResult.events.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase text-white/30 tracking-widest mb-6">
              Eventos Anteriores
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastResult.events.map((event) => {
                const config = EVENT_TYPE_CONFIG[event.eventType] ?? EVENT_TYPE_CONFIG.other;
                const TypeIcon = config.icon;
                return (
                  <div
                    key={event.id}
                    className="bg-surface-container-lowest border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded-full ${config.className} opacity-60`}
                      >
                        <TypeIcon size={10} />
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-headline font-semibold text-white/70 mb-1">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs text-white/30 line-clamp-1 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-white/20">
                      <Clock size={12} />
                      {formatEventDate(event.startAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
