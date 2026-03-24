import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { CategoriesManager } from "./CategoriesManager";

async function getCategories() {
  try {
    return await db.select().from(blogCategories).orderBy(asc(blogCategories.sortOrder));
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Categorias
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Gerir categorias do blog
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
