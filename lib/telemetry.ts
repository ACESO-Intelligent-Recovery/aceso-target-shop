/**
 * Telemetry and Anomaly Signal Tracking Client for Aceso Target Shop.
 * Handles PostHog event dispatching with automatic synthetic traffic tagging.
 */

declare global {
  interface Window {
    __ACESO_SYNTHETIC__?: boolean;
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

  // If running in browser and posthog is attached
  if (typeof window !== "undefined") {
    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry][${syntheticFlag ? "SYNTHETIC" : "USER"}] ${event}`, payload);
    }

    // Call PostHog JS if available
    const win = window as unknown as { posthog?: { capture: (name: string, data: unknown) => void } };
    if (win.posthog && typeof win.posthog.capture === "function") {
      win.posthog.capture(event, payload);
    }
  }
}
