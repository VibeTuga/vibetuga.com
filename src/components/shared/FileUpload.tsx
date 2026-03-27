"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, Loader2, FileIcon } from "lucide-react";

type FileUploadProps = {
  value: string;
  onChange: (key: string) => void;
  accept?: string;
  maxSizeMB?: number;
};

function extractFilename(key: string): string {
  const parts = key.split("/");
  const filename = parts[parts.length - 1];
  // Remove timestamp prefix if present (e.g. "1234567890-filename.zip" → "filename.zip")
  return filename.replace(/^\d+-/, "");
}

export function FileUpload({ value, onChange, accept = "*/*", maxSizeMB = 100 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`Ficheiro demasiado grande (máx. ${maxSizeMB} MB)`);
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/product", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erro no upload (${res.status})`);
        }

        const { key } = await res.json();
        onChange(key);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido no upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange, maxSizeMB],
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

  const handleRemove = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  if (value) {
    return (
      <div>
        <div className="flex items-center gap-3 p-4 border border-white/5 bg-surface-container-lowest group">
          <FileIcon className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-mono text-white truncate flex-1">
            {extractFilename(value)}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            Alterar
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      {uploading ? (
        <div className="flex flex-col items-center justify-center h-32 border border-dashed border-white/10 bg-surface-container-lowest">
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
          <span className="text-xs font-mono text-white/40">A carregar...</span>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-32 border border-dashed cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-white/10 bg-surface-container-lowest hover:border-white/20"
          }`}
        >
          <Upload className={`w-6 h-6 mb-2 ${dragging ? "text-primary" : "text-white/30"}`} />
          <span className="text-xs font-mono text-white/40 text-center px-4">
            Arrasta um ficheiro ou clica para selecionar
          </span>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-mono text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
