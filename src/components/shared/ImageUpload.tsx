"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, Loader2, Link } from "lucide-react";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  className?: string;
};

export function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Tipo de ficheiro não suportado. Usa JPEG, PNG, GIF, WebP, AVIF ou SVG.");
        return;
      }

      setUploading(true);

      try {
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({}));
          throw new Error(data.error || `Erro ao obter URL de upload (${presignRes.status})`);
        }

        const { uploadUrl, key, publicUrl } = await presignRes.json();

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error("Erro ao fazer upload da imagem");
        }

        onChange(publicUrl ?? key);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido no upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      if (e.target) e.target.value = "";
    },
    [uploadFile],
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlValue("");
      setShowUrlInput(false);
      setError(null);
    }
  }, [urlValue, onChange]);

  const handleRemove = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative overflow-hidden rounded-sm border border-white/10">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-mono bg-surface-container-lowest border border-white/10 text-white hover:border-primary transition-colors"
            >
              Alterar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {uploading ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-sm bg-surface-container-lowest">
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
          <span className="text-xs font-mono text-white/40">A carregar...</span>
        </div>
      ) : showUrlInput ? (
        <div className="flex flex-col gap-2 p-4 border border-dashed border-white/10 rounded-sm bg-surface-container-lowest">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="https://..."
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-transparent border border-white/10 text-white placeholder:text-white/20 focus:border-primary outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3 py-1.5 text-xs font-mono bg-primary text-black hover:bg-primary/90 transition-colors"
            >
              OK
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="text-xs font-mono text-white/30 hover:text-white/50 transition-colors text-left"
          >
            &larr; Voltar ao upload
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-48 border border-dashed rounded-sm cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-white/10 bg-surface-container-lowest hover:border-white/20"
          }`}
        >
          <Upload className={`w-6 h-6 mb-2 ${dragging ? "text-primary" : "text-white/30"}`} />
          <span className="text-xs font-mono text-white/40 text-center px-4">
            Arrasta uma imagem ou clica para selecionar
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlInput(true);
            }}
            className="mt-3 text-xs font-mono text-white/20 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <Link className="w-3 h-3" />
            Ou cola um URL
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-mono text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
