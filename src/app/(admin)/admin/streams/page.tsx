import type { Metadata } from "next";
import { getAllStreams } from "@/lib/db/queries/streams";
import { StreamsManager } from "@/components/admin/StreamsManager";

export const metadata: Metadata = {
  title: "Streams | Admin VibeTuga",
};

export default async function AdminStreamsPage() {
  const streams = await getAllStreams();

  return <StreamsManager initialStreams={JSON.parse(JSON.stringify(streams))} />;
}
