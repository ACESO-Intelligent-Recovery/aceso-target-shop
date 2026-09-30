"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { isSynthetic } from "./telemetry";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (posthogKey && typeof window !== "undefined") {
      const isSyntheticTraffic = isSynthetic();

      // Expose posthog on window for external callers, synthetic scripts, and E2E tests
      window.posthog = posthog;

      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        // Critical: Allow headless synthetic Playwright traffic to capture telemetry without bot suppression
        opt_out_useragent_filter: true,
        // Disable request batching for synthetic traffic to ensure immediate network dispatch
        request_batching: !isSyntheticTraffic,
        // Critical quota safeguard from Blueprint (lines 883, 922):
        // Disable heavy session recordings for automated synthetic cron runs
        disable_session_recording: isSyntheticTraffic,
        loaded: (ph) => {
          window.posthog = posthog;
          if (process.env.NODE_ENV !== "production") {
            ph.debug();
          }
        },
      });

      if (isSyntheticTraffic) {
        posthog.register({ synthetic: true, traffic_tier: "synthetic_cron" });
      }

      const buildContext = {
        aceso_deployment_id: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || "local-dev",
        aceso_release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || "local-dev",
        aceso_environment:
          process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.NODE_ENV || "development",
      };
      const runId = window.__ACESO_PREVIEW_CONTEXT__?.runId;
      posthog.register({ ...buildContext, ...(runId ? { aceso_preview_run_id: runId } : {}) });
    }
  }, []);

  return <>{children}</>;
}
