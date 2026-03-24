import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.vibetuga.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Suppresses source map uploading logs during build
  silent: true,

  // Upload source maps for better stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when auth token is available (production builds)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Delete source maps after upload to hide them from client bundles
  sourcemaps: {
    filesToDeleteAfterUpload: [".next/static/**/*.map"],
  },

  // Tunnel Sentry events to avoid ad-blockers
  tunnelRoute: "/monitoring",
});
