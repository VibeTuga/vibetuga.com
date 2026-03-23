const SITE_URL = "https://vibetuga.com";

// ─── Organization ──────────────────────────────────────────────────────────────

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VibeTuga",
    url: SITE_URL,
    description:
      "A comunidade portuguesa de vibe coding, IA e desenvolvimento assistido por agentes.",
    sameAs: [
      "https://discord.vibetuga.com",
      "https://www.youtube.com/@VibeTuga",
      "https://www.twitch.tv/vibetugaai",
      "https://www.tiktok.com/@vibetugaai",
    ],
  };
}

// ─── WebSite with SearchAction ─────────────────────────────────────────────────

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VibeTuga",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Article ───────────────────────────────────────────────────────────────────

export function getArticleJsonLd(post: {
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  coverImage?: string | null;
  authorDisplayName?: string | null;
  authorName?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt)?.toISOString(),
    image: post.coverImage ?? undefined,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: post.authorDisplayName || post.authorName || "VibeTuga",
    },
    publisher: {
      "@type": "Organization",
      name: "VibeTuga",
      url: SITE_URL,
    },
  };
}

// ─── Product ───────────────────────────────────────────────────────────────────

export function getProductJsonLd(product: {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  priceCents: number;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.coverImage ?? undefined,
    url: `${SITE_URL}/store/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };
}
