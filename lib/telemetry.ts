/**
 * Telemetry and Anomaly Signal Tracking Client for Aceso Target Shop.
 * Handles PostHog event dispatching with automatic synthetic traffic tagging.
 */

import posthog from "posthog-js";

declare global {
  interface Window {
    __ACESO_SYNTHETIC__?: boolean;
    __ACESO_EVENTS__?: Array<{ event: string; [key: string]: unknown }>;
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
  const payload = {
    ...properties,
    synthetic: syntheticFlag,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    if (Array.isArray(window.__ACESO_EVENTS__)) {
      window.__ACESO_EVENTS__.push({ event, ...payload });
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry][${syntheticFlag ? "SYNTHETIC" : "USER"}] ${event}`, payload);
    }

    try {
      if (posthog && typeof posthog.capture === "function") {
        posthog.capture(event, payload);
      }
    } catch (err) {
      console.warn("[Telemetry] Failed to capture event in PostHog:", err);
    }
  }
}
