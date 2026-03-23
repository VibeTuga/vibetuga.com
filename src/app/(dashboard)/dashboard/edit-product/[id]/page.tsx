"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PRODUCT_TYPES = [
  { value: "skill", label: "Skill" },
  { value: "auto_runner", label: "Auto Runner" },
  { value: "agent_kit", label: "Agent Kit" },
  { value: "prompt_pack", label: "Pack de Prompts" },
  { value: "template", label: "Template" },
  { value: "course", label: "Curso" },
  { value: "guide", label: "Guia" },
  { value: "other", label: "Outro" },
] as const;

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceCents: number;
  productType: string;
  status: string;
  coverImage: string | null;
  tags: string[] | null;
  downloadKey?: string | null;
  sellerId: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(true);
  const [description, setDescription] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [productType, setProductType] = useState("other");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [downloadKey, setDownloadKey] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/store/products/${id}`);

        if (res.status === 404) {
          setError("Produto não encontrado.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError("Erro ao carregar produto.");
          setLoading(false);
          return;
        }

        const data: ProductData = await res.json();
        setProduct(data);

        setTitle(data.title);
        setSlug(data.slug);
        setDescription(data.description ?? "");
        setPriceEuros((data.priceCents / 100).toFixed(2).replace(".", ","));
        setProductType(data.productType);
        setCoverImage(data.coverImage ?? "");
        setTags(data.tags ? data.tags.join(", ") : "");
        setDownloadKey(data.downloadKey ?? "");
      } catch {
        setError("Erro ao carregar produto.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    const priceNum = parseFloat(priceEuros.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Preço inválido. Insere um valor numérico válido.");
      return;
    }

    const priceCents = Math.round(priceNum * 100);

    setSaving(true);
    setError(null);

    try {
      const tagsArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/store/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          priceCents,
          productType,
          coverImage: coverImage.trim() || null,
          tags: tagsArr,
          downloadKey: downloadKey.trim() || null,
        }),
      });

      if (res.status === 401) {
        setError("Precisas de fazer login.");
        return;
      }

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error || "Apenas produtos em rascunho podem ser editados.");
        return;
      }

      if (res.status === 409) {
        setError("Já existe um produto com este slug. Tenta outro título.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao guardar alterações.");
        return;
      }

      router.push("/dashboard/my-products");
    } catch {
      setError("Erro ao guardar alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm("Tens a certeza que queres eliminar este produto? Esta ação é irreversível.")
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/store/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao eliminar produto.");
        return;
      }

      router.push("/dashboard/my-products");
    } catch {
      setError("Erro ao eliminar produto.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-4 w-48 bg-white/5 mb-2" />
          <div className="h-3 w-72 bg-white/5" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-white/5 mb-2" />
              <div className="h-12 bg-white/5" />
            </div>
          ))}
        </div>
        <div className="h-12 w-48 bg-white/5" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="font-headline text-2xl font-bold text-white mb-4">Produto não encontrado</h1>
        <p className="text-white/40 text-sm mb-8">
          {error || "O produto que procuras não existe ou foi removido."}
        </p>
        <button
          onClick={() => router.push("/dashboard/my-products")}
          className="px-6 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          Voltar aos Meus Produtos
        </button>
      </div>
    );
  }

  const isDraft = product.status === "draft";

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Editar Produto
        </h1>
        <p className="text-white/40 text-sm">
          Altera os detalhes do teu produto. Apenas rascunhos podem ser editados.
        </p>
      </header>

      {!isDraft && (
        <div className="mb-6 p-4 border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs font-mono">
          Este produto não está em rascunho e não pode ser editado. Estado atual:{" "}
          <span className="uppercase font-bold">{product.status}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Nome do teu produto"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="nome-do-produto"
          />
          <p className="mt-1 text-[10px] font-mono text-white/20">URL: /store/{slug || "..."}</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-y transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Descreve o teu produto — o que faz, para quem é, o que inclui... (suporta Markdown)"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Preço (€) *
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            required
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="9,99"
          />
          <p className="mt-1 text-[10px] font-mono text-white/20">Usa 0 para produtos gratuitos</p>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Tipo de Produto
          </label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 text-white text-sm p-4 font-body transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {PRODUCT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Imagem de Capa
          </label>
          {isDraft ? (
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          ) : (
            <div className="w-full bg-surface-container-lowest border border-white/5 text-white/50 text-sm p-4 opacity-50">
              {coverImage || "Sem imagem"}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="react, ai, automation (separadas por vírgulas)"
          />
        </div>

        {/* Download Key */}
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Chave de Download (R2)
          </label>
          <input
            type="text"
            value={downloadKey}
            onChange={(e) => setDownloadKey(e.target.value)}
            disabled={!isDraft}
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="products/meu-produto.zip"
          />
          <p className="mt-1 text-[10px] font-mono text-white/20">
            Caminho do ficheiro no bucket R2 (para entrega após compra)
          </p>
        </div>

        {error && <p className="text-error text-xs font-mono">{error}</p>}

        <div className="flex items-center gap-4">
          {isDraft && (
            <button
              type="submit"
              disabled={saving || !title.trim() || !slug.trim() || !priceEuros}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Alterações
            </button>
          )}

          {isDraft && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs uppercase hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Eliminar Produto
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
