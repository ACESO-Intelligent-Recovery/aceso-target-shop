import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Vercel builds only; see next.config.ts.
  enabled: process.env.NEXT_PUBLIC_ACESO_SENTRY_ENABLED === "1",
  tracesSampleRate: 0.1,
  debug: false,
  release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || "local-dev",
  environment: process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.NODE_ENV || "development",
  initialScope: {
    tags: {
      aceso_deployment_id: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || "local-dev",
    },
  },
});
