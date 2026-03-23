"use client";

import { useEffect, useState, useRef } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Wait for content to render, then parse headings
    const timer = setTimeout(() => {
      const blogContent = document.querySelector(".blog-content");
      if (!blogContent) return;

      const elements = blogContent.querySelectorAll("h2, h3");
      const items: TocItem[] = [];

      elements.forEach((el) => {
        if (el.id && el.textContent) {
          items.push({
            id: el.id,
            text: el.textContent.trim(),
            level: el.tagName === "H2" ? 2 : 3,
          });
        }
      });

      setHeadings(items);

      // Set up IntersectionObserver for active section tracking
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const visibleIds = new Set<string>();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleIds.add(entry.target.id);
            } else {
              visibleIds.delete(entry.target.id);
            }
          });

          // Pick the first visible heading in document order
          const orderedIds = items.map((item) => item.id);
          for (const id of orderedIds) {
            if (visibleIds.has(id)) {
              setActiveId(id);
              return;
            }
          }
        },
        {
          rootMargin: "-80px 0px -60% 0px",
          threshold: 0,
        },
      );

      elements.forEach((el) => {
        if (el.id) {
          observerRef.current?.observe(el);
        }
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden lg:block sticky top-24" aria-label="Índice do artigo">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left mb-3"
      >
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Índice
        </span>
        <span className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] text-white/20">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <ul className="space-y-1 border-l border-white/5 pl-0">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const isH3 = heading.level === 3;

            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      // Update active after scroll
                      setActiveId(heading.id);
                    }
                  }}
                  className={`block text-xs leading-relaxed transition-colors py-1 ${
                    isH3 ? "pl-6" : "pl-3"
                  } border-l -ml-px ${
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-white/35 hover:text-white/60 hover:border-white/20"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
