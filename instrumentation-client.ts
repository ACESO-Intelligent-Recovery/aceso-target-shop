/**
 * Client-side telemetry bootstrap. Next.js runs this file before the app
 * becomes interactive (see node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/instrumentation-client.md).
 *
 * Both SDKs must start here:
 * - Sentry: under Turbopack, `sentry.client.config.ts` is never loaded, so
 *   browser exceptions were not reported at all.
 * - PostHog: it used to start in a provider's useEffect, which React runs
 *   after the page's own effects, so events fired on the first page a visitor
 *   lands on (e.g. product_viewed) were silently dropped.
 */
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

const buildContext = {
  deploymentId: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || "local-dev",
  release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || "local-dev",
  environment: process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.NODE_ENV || "development",
};

window.__ACESO_BUILD_CONTEXT__ = buildContext;
// Playwright sets this flag with addInitScript, which runs before this file.
const isSyntheticTraffic = Boolean(window.__ACESO_SYNTHETIC__);

try {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Vercel builds only; see next.config.ts.
    enabled: process.env.NEXT_PUBLIC_ACESO_SENTRY_ENABLED === "1",
    // Free-tier hygiene (5K errors/month).
    tracesSampleRate: 0.1,
    debug: false,
    release: buildContext.release,
    environment: buildContext.environment,
    initialScope: {
      tags: { aceso_deployment_id: buildContext.deploymentId },
    },
  });
} catch (err) {
  console.warn("[Telemetry] Sentry init failed:", err);
}

try {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      // Count client-side navigations too (router.push between pages), not only
      // full page loads: the detector's per-route error rate is exceptions per
      // page view, and /checkout, /search and / had too few full loads to be
      // scored in the 2026-10-08 trial (DL-41).
      capture_pageview: "history_change",
      // Send browser exceptions to PostHog: the per-route error rate (DL-36)
      // counts $exception events, and none were sent before this.
      capture_exceptions: true,
      capture_pageleave: true,
      autocapture: true,
      // Headless synthetic Playwright traffic must not be bot-filtered.
      opt_out_useragent_filter: true,
      // Send synthetic events immediately rather than in batches.
      request_batching: !isSyntheticTraffic,
      // Session recordings would exhaust the free quota on synthetic runs.
      disable_session_recording: isSyntheticTraffic,
    });
    window.posthog = posthog;
    if (isSyntheticTraffic) {
      posthog.register({ synthetic: true, traffic_tier: "synthetic_cron" });
    }
    const runId = window.__ACESO_PREVIEW_CONTEXT__?.runId;
    posthog.register({
      aceso_deployment_id: buildContext.deploymentId,
      aceso_release: buildContext.release,
      aceso_environment: buildContext.environment,
      ...(runId ? { aceso_preview_run_id: runId } : {}),
    });
  }
} catch (err) {
  console.warn("[Telemetry] PostHog init failed:", err);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
