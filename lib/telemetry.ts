/**
 * Telemetry and Anomaly Signal Tracking Client for Aceso Target Shop.
 * Handles PostHog event dispatching with automatic synthetic traffic tagging.
 */

import posthog from "posthog-js";

declare global {
  interface Window {
    __ACESO_SYNTHETIC__?: boolean;
    __ACESO_EVENTS__?: Array<{ event: string; [key: string]: unknown }>;
    posthog?: typeof posthog;
    __ACESO_PREVIEW_CONTEXT__?: { runId?: string };
    __ACESO_BUILD_CONTEXT__?: {
      deploymentId: string;
      release: string;
      environment: string;
    };
  }
}

export type FunnelEvent =
  | "search_performed"
  | "product_viewed"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed";

export interface TelemetryPayload {
  [key: string]: unknown;
}

if (typeof window !== "undefined") {
  window.__ACESO_BUILD_CONTEXT__ = {
    deploymentId: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || "local-dev",
    release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || "local-dev",
    environment:
      process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.NODE_ENV || "development",
  };
}

export function isSynthetic(): boolean {
  if (typeof window !== "undefined") {
    return Boolean(window.__ACESO_SYNTHETIC__);
  }
  return false;
}

/**
 * Dispatch an event to PostHog with synthetic tagging.
 */
export function trackEvent(event: FunnelEvent, properties: TelemetryPayload = {}): void {
  const syntheticFlag = isSynthetic() || Boolean(properties.synthetic);
  const buildContext = {
    deploymentId: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || "local-dev",
    release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || "local-dev",
    environment:
      process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.NODE_ENV || "development",
  };
  const runId = typeof window !== "undefined" ? window.__ACESO_PREVIEW_CONTEXT__?.runId : undefined;
  const payload = {
    ...properties,
    synthetic: syntheticFlag,
    timestamp: new Date().toISOString(),
    ...(buildContext.deploymentId !== "local-dev" && {
      aceso_deployment_id: buildContext.deploymentId,
      aceso_release: buildContext.release,
      aceso_environment: buildContext.environment,
    }),
    ...(runId && { aceso_preview_run_id: runId }),
  };

  if (typeof window !== "undefined") {
    window.__ACESO_BUILD_CONTEXT__ = buildContext;
    if (!window.posthog && posthog) {
      window.posthog = posthog;
    }
    window.__ACESO_EVENTS__ = window.__ACESO_EVENTS__ || [];
    window.__ACESO_EVENTS__.push({ event, ...payload });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry][${syntheticFlag ? "SYNTHETIC" : "USER"}] ${event}`, payload);
    }

    try {
      if (posthog && typeof posthog.capture === "function") {
        posthog.capture(event, payload, { send_instantly: true });
      }
    } catch (err) {
      console.warn("[Telemetry] Failed to capture event in PostHog:", err);
    }
  }
}
