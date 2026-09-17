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

      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        // Critical quota safeguard from Blueprint (lines 883, 922):
        // Disable heavy session recordings for automated synthetic cron runs
        disable_session_recording: isSyntheticTraffic,
        loaded: (ph) => {
          if (process.env.NODE_ENV !== "production") {
            ph.debug();
          }
        },
      });

      if (isSyntheticTraffic) {
        posthog.register({ synthetic: true, traffic_tier: "synthetic_cron" });
      }
    }
  }, []);

  return <>{children}</>;
}
