import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, runFixture, testInfo) => {
    const runId = process.env.ACESO_PREVIEW_RUN_ID;
    await page.addInitScript((previewRunId) => {
      window.__ACESO_PREVIEW_CONTEXT__ = { runId: previewRunId };
    }, runId);

    await runFixture(page);

    // Send a positive heartbeat only after the browser journey passed. The
    // verifier checks these properties in PostHog against the Vercel build.
    if (testInfo.status === "passed" && runId) {
      const expectedDeploymentId = process.env.ACESO_PREVIEW_DEPLOYMENT_ID;
      const expectedRelease = process.env.ACESO_PREVIEW_RELEASE;
      const context = await page.evaluate(() => window.__ACESO_BUILD_CONTEXT__);
      if (
        !context ||
        context.deploymentId !== expectedDeploymentId ||
        context.release !== expectedRelease ||
        context.environment !== "preview"
      ) {
        throw new Error("Browser build identity does not match the preview under test.");
      }
      const telemetryResponse = page.waitForResponse(
        (response) => new URL(response.url()).pathname.endsWith("/e/"),
        { timeout: 10000 }
      );
      await page.evaluate((journeyRunId) => {
        const posthogClient = window.posthog;
        if (!posthogClient || typeof posthogClient.capture !== "function") {
          throw new Error("PostHog is not initialized; cannot emit preview completion evidence.");
        }
        posthogClient.capture(
          "aceso_preview_journey_completed",
          {
            ...window.__ACESO_BUILD_CONTEXT__,
            aceso_deployment_id: window.__ACESO_BUILD_CONTEXT__?.deploymentId,
            aceso_release: window.__ACESO_BUILD_CONTEXT__?.release,
            aceso_environment: window.__ACESO_BUILD_CONTEXT__?.environment,
            aceso_preview_run_id: journeyRunId,
            synthetic: true,
          },
          { send_instantly: true }
        );
      }, runId);
      const response = await telemetryResponse;
      if (!response.ok()) {
        throw new Error(`PostHog rejected the preview completion event (${response.status()}).`);
      }
    }
  },
});

export { expect };
