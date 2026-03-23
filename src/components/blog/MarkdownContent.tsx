"use client";

import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import "highlight.js/styles/github-dark.css";

function CopyButton({ code }: { code: string }) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      const btn = document.activeElement as HTMLButtonElement | null;
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Copiado!";
        setTimeout(() => {
          btn.textContent = original;
        }, 2000);
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-mono text-white/40 hover:text-primary px-2 py-1 transition-colors uppercase tracking-wider"
      aria-label="Copiar código"
    >
      Copiar
    </button>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const el = node as { props: { children?: React.ReactNode } };
    return extractText(el.props.children);
  }
  return "";
}

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const components: Components = {
    pre({ children }) {
      // Extract language from the <code> child's className
      const codeChild = children as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
      }>;
      let language = "";
      if (codeChild?.props?.className) {
        const match = codeChild.props.className.match(/(?:language-|hljs\s+language-)(\S+)/);
        if (match) language = match[1];
      }

      const codeText = extractText(codeChild?.props?.children ?? "");

      return (
        <div className="code-block-wrapper group relative bg-[#0D0D0D] border border-white/10 rounded-lg overflow-hidden my-6">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            {language ? (
              <span className="text-[10px] font-mono text-primary/70 uppercase tracking-widest">
                {language}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                code
              </span>
            )}
            <CopyButton code={codeText} />
          </div>
          <pre className="!bg-transparent !border-0 !m-0 !rounded-none overflow-x-auto">
            {children}
          </pre>
        </div>
      );
    },
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
