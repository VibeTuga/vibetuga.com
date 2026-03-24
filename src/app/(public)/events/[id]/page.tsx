import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getEventById } from "@/lib/db/queries/events";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Radio,
  BookOpen,
  Trophy,
  Users,
  Sparkles,
  User,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return { title: "Evento não encontrado | VibeTuga" };
  }

  return {
    title: `${event.title} | Eventos VibeTuga`,
    description: event.description ?? `Evento ${event.title} da comunidade VibeTuga.`,
    openGraph: {
      title: event.title,
      description: event.description ?? `Evento ${event.title} da comunidade VibeTuga.`,
      type: "website",
      ...(event.coverImage ? { images: [{ url: event.coverImage }] } : {}),
    },
    alternates: {
      canonical: `https://vibetuga.com/events/${id}`,
    },
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const config = EVENT_TYPE_CONFIG[event.eventType] ?? EVENT_TYPE_CONFIG.other;
  const TypeIcon = config.icon;
  const creatorName = event.creatorDisplayName ?? event.creatorName ?? "VibeTuga";

  const formattedDate = event.startAt.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime = event.startAt.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = event.endAt
    ? event.endAt.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-mono text-white/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Voltar aos eventos
        </Link>

        {/* Type badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase rounded-full ${config.className}`}
          >
            <TypeIcon size={14} />
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-white mb-6">
          {event.title}
        </h1>

        {/* Cover image */}
        {event.coverImage && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 border border-primary/10">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Meta info */}
        <div className="bg-surface-container-low border border-primary/10 rounded-lg p-6 mb-8 space-y-4">
          {/* Date & time */}
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium capitalize">{formattedDate}</p>
              <p className="text-sm text-white/40 font-mono">
                {formattedStartTime}
                {formattedEndTime && ` — ${formattedEndTime}`}
              </p>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3">
            <User size={18} className="text-primary shrink-0" />
            <p className="text-white/60 text-sm">
              Organizado por <span className="text-white font-medium">{creatorName}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-4">
              Descrição
            </h2>
            <p className="text-white/60 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* External link button */}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-headline font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ExternalLink size={18} />
            Participar no Evento
          </a>
        )}
      </div>
    </main>
  );
}
