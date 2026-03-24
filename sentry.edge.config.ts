import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Only initialize if DSN is configured
  enabled: !!process.env.SENTRY_DSN,
});
