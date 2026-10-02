import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Public release metadata that identifies the exact Vercel preview build.
  env: {
    NEXT_PUBLIC_ACESO_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID || "local-dev",
    NEXT_PUBLIC_ACESO_RELEASE_ID: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    NEXT_PUBLIC_ACESO_ENVIRONMENT: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    // Sentry reports only from Vercel builds (preview and production). Local
    // dev servers and local production builds run the seeded bugs during
    // AcesoLoop's test gates; reporting those used most of the free 5K
    // errors/month. Set ACESO_SENTRY_LOCAL=1 to report from a local build.
    NEXT_PUBLIC_ACESO_SENTRY_ENABLED:
      process.env.VERCEL === "1" || process.env.ACESO_SENTRY_LOCAL === "1" ? "1" : "0",
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  org: "aceso-qq",
  project: "aceso-target-shop",
  widenClientFileUpload: true,
});
