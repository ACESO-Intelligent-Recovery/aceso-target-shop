import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Adjust sample rates for free-tier hygiene (Blueprint line 593: 5K errors/mo limit)
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
