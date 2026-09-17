import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Adjust sample rates for free-tier hygiene (Blueprint line 593: 5K errors/mo limit)
  tracesSampleRate: 0.1,
  debug: false,
  // Match release string to Vercel deployment ID / Git SHA for HC-1.2 verification
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local-dev",
  environment: process.env.NODE_ENV || "development",
});
