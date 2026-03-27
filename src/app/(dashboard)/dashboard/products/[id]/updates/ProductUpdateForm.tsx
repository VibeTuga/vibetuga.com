"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { FileUpload } from "@/components/shared/FileUpload";

export function ProductUpdateForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [downloadKey, setDownloadKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/store/products/${productId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: version.trim(),
          changelog: changelog.trim(),
          downloadKey: downloadKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar atualização.");
        return;
      }

      setSuccess("Atualização publicada com sucesso!");
      setVersion("");
      setChangelog("");
      setDownloadKey("");
      router.refresh();
    } catch {
      setError("Erro de rede. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Versão *
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.2.0"
            required
            maxLength={50}
            className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm font-mono border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
            Novo ficheiro (opcional)
          </label>
          <FileUpload value={downloadKey} onChange={setDownloadKey} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
          Changelog *
        </label>
        <textarea
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          placeholder="Descreve as alterações desta versão..."
          required
          maxLength={5000}
          rows={5}
          className="w-full px-4 py-3 bg-surface-container-lowest text-white text-sm border border-white/5 rounded focus:border-tertiary focus:outline-none transition-colors placeholder:text-white/20 resize-y"
        />
      </div>

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {success && <p className="text-xs text-primary font-mono">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload size={14} />
        {loading ? "A publicar..." : "Publicar Atualização"}
      </button>
    </form>
  );
}
