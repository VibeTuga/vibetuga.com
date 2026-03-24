"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Trash2, Package, Plus, ChevronDown, ChevronRight } from "lucide-react";
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

      {/* Product Updates Section - available for non-draft (approved/pending) products */}
      {product && product.status !== "draft" && <ProductUpdateSection productId={id} />}
    </div>
  );
}

// ─── Product Update Section ──────────────────────────────

interface UpdateItem {
  id: number;
  version: string;
  changelog: string;
  downloadUrl: string | null;
  createdAt: string;
}

function ProductUpdateSection({ productId }: { productId: string }) {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [newVersion, setNewVersion] = useState("");
  const [newChangelog, setNewChangelog] = useState("");
  const [newDownloadUrl, setNewDownloadUrl] = useState("");

  useEffect(() => {
    fetch(`/api/store/products/${productId}/updates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUpdates(data);
          if (data.length > 0) setExpandedId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newVersion.trim() || !newChangelog.trim()) return;

    setSubmitting(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/store/products/${productId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: newVersion.trim(),
          changelog: newChangelog.trim(),
          downloadUrl: newDownloadUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setUpdateError(data.error || "Erro ao publicar atualização.");
        return;
      }

      const update = await res.json();
      setUpdates((prev) => [update, ...prev]);
      setExpandedId(update.id);
      setNewVersion("");
      setNewChangelog("");
      setNewDownloadUrl("");
      setShowForm(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch {
      setUpdateError("Erro ao publicar atualização.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package size={20} className="text-primary" />
          Atualizações do Produto
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          <Plus size={14} />
          Nova Atualização
        </button>
      </div>

      {updateSuccess && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
          Atualização publicada com sucesso!
        </div>
      )}

      {/* New Update Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitUpdate}
          className="mb-6 p-6 bg-surface-container border border-white/5 rounded-xl space-y-4"
        >
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Versão *
            </label>
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              required
              className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-3 font-mono placeholder:text-white/20 transition-all outline-none"
              placeholder="1.2.0"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Changelog *
            </label>
            <textarea
              value={newChangelog}
              onChange={(e) => setNewChangelog(e.target.value)}
              required
              rows={4}
              className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-3 font-body placeholder:text-white/20 resize-y transition-all outline-none"
              placeholder="Descreve as alterações desta versão..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              URL de Download (opcional)
            </label>
            <input
              type="url"
              value={newDownloadUrl}
              onChange={(e) => setNewDownloadUrl(e.target.value)}
              className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-3 font-mono placeholder:text-white/20 transition-all outline-none"
              placeholder="https://..."
            />
          </div>

          {updateError && <p className="text-error text-xs font-mono">{updateError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !newVersion.trim() || !newChangelog.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
              Publicar Atualização
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 text-white/40 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Updates List */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <p className="text-white/20 text-sm font-mono text-center py-8">
          Sem atualizações publicadas
        </p>
      ) : (
        <div className="space-y-2">
          {updates.map((update, i) => {
            const isExpanded = expandedId === update.id;
            const isLatest = i === 0;
            return (
              <div
                key={update.id}
                className="bg-surface-container border border-white/5 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : update.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-white/30 shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-white/30 shrink-0" />
                  )}
                  <span className="font-mono text-sm text-primary font-bold">
                    v{update.version}
                  </span>
                  {isLatest && (
                    <span className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-widest">
                      Última
                    </span>
                  )}
                  <span className="ml-auto text-[10px] font-mono text-white/30">
                    {new Date(update.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <p className="text-sm text-white/60 leading-relaxed mt-3 whitespace-pre-wrap">
                      {update.changelog}
                    </p>
                    {update.downloadUrl && (
                      <a
                        href={update.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-colors rounded"
                      >
                        <Package size={12} />
                        Download v{update.version}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
