import type { Metadata } from "next";
import { getAllEvents } from "@/lib/db/queries/events";
import { EventsManager } from "@/components/admin/EventsManager";

export const metadata: Metadata = {
  title: "Eventos | Admin VibeTuga",
};

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return <EventsManager initialEvents={JSON.parse(JSON.stringify(events))} />;
}
