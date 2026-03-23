"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";
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

export default function SubmitProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [productType, setProductType] = useState("other");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [downloadKey, setDownloadKey] = useState("");

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

    setSubmitting(true);
    setError(null);

    try {
      const tagsArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/store/products", {
        method: "POST",
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
        setError(
          "Apenas vendedores podem criar produtos. Contacta um admin para atualizar o teu perfil.",
        );
        return;
      }

      if (res.status === 409) {
        setError("Já existe um produto com este slug. Tenta outro título.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao submeter produto.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao submeter produto.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <CheckCircle size={48} className="text-primary mx-auto mb-6" />
        <h1 className="font-headline text-2xl font-bold text-white mb-4">Produto Submetido!</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
          O teu produto foi enviado para revisão. Um moderador irá analisá-lo em breve.
        </p>
        <button
          onClick={() => router.push("/dashboard/my-products")}
          className="px-6 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          Ver Meus Produtos
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Submeter Produto
        </h1>
        <p className="text-white/40 text-sm">
          Adiciona um produto digital à loja. Será revisto antes de ficar disponível.
        </p>
      </header>

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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none"
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 resize-y transition-all outline-none"
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none"
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 text-white text-sm p-4 font-body transition-all outline-none"
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
          <ImageUpload value={coverImage} onChange={setCoverImage} />
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-body placeholder:text-white/20 transition-all outline-none"
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
            className="w-full bg-surface-container-lowest border border-white/5 focus:border-tertiary/50 focus:shadow-[0_0_8px_rgba(129,233,255,0.15)] text-white text-sm p-4 font-mono placeholder:text-white/20 transition-all outline-none"
            placeholder="products/meu-produto.zip"
          />
          <p className="mt-1 text-[10px] font-mono text-white/20">
            Caminho do ficheiro no bucket R2 (para entrega após compra)
          </p>
        </div>

        {error && <p className="text-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title.trim() || !slug.trim() || !priceEuros}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Submeter para Revisão
        </button>
      </form>
    </div>
  );
}
