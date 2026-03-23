import { getSeriesForAdmin } from "@/lib/db/queries/blog";
import { SeriesManager } from "./SeriesManager";

export default async function AdminSeriesPage() {
  const series = await getSeriesForAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Séries
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Agrupar posts em coleções ordenadas
        </p>
      </div>

      <SeriesManager initialSeries={series} />
    </div>
  );
}
