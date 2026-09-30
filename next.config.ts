import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Public release metadata that identifies the exact Vercel preview build.
  env: {
    NEXT_PUBLIC_ACESO_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID || "local-dev",
    NEXT_PUBLIC_ACESO_RELEASE_ID: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    NEXT_PUBLIC_ACESO_ENVIRONMENT: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  org: "aceso-qq",
  project: "aceso-target-shop",
  widenClientFileUpload: true,
});
