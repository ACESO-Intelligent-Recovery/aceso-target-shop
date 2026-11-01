import { appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test as base, expect } from "@playwright/test";

// DL-74: a page load that gets no response at all is retried once. Each retry is logged
// here (outside the repo, so the shop checkout stays clean) and printed with the test name.
const GOTO_RETRY_LOG = process.env.ACESO_GOTO_RETRY_LOG || join(tmpdir(), "aceso-goto-retries.log");
const FIRST_LOAD_TIMEOUT_MS = 30000;
const RETRY_LOAD_TIMEOUT_MS = 45000;

function gotNoResponse(error: unknown): boolean {
  // A navigation timeout or a network error means no response arrived. An HTTP error
  // status (a seeded 500) resolves goto normally and is never retried.
  if (!(error instanceof Error)) return false;
  return error.name === "TimeoutError" || /net::ERR_/.test(error.message);
}

export const test = base.extend({
  page: async ({ page }, runFixture, testInfo) => {
    const runId = process.env.ACESO_PREVIEW_RUN_ID;
    await page.addInitScript((previewRunId) => {
      window.__ACESO_PREVIEW_CONTEXT__ = { runId: previewRunId };
    }, runId);

    // The page's "load" event can wait forever on a resource the journey does
    // not need: on 2026-10-07 page.goto("/login") timed out at 90 s on a preview
    // whose page had fully rendered. Vercel's preview toolbar (vercel.live) is
    // not part of the shop, so it is blocked; and goto waits for the HTML, then
    // up to 15 s for "load" without failing, so hydration still usually
    // finishes before the first click. The journeys' expects wait for content.
    await page.route(/^https:\/\/vercel\.live\//, (route) => route.abort());
    const goto = page.goto.bind(page);
    //
    // On 2026-10-29 a preview gave no response at all to one page load for 90 s, then
    // answered normally (D2 batch 1, MU-02). Such a load is retried once, after 30 s; the two
    // waits (30 s + 45 s) stay under the proof's 90 s test timeout. Only the fetch is retried,
    // never an assertion, and a page that hangs on every load still fails (DL-74).
    page.goto = async (url, options) => {
      if (options?.waitUntil) return goto(url, options);
      let response: Awaited<ReturnType<typeof goto>>;
      try {
        response = await goto(url, { timeout: FIRST_LOAD_TIMEOUT_MS, ...options, waitUntil: "domcontentloaded" });
      } catch (error) {
        if (!gotNoResponse(error)) throw error;
        const reason = (error as Error).message.split("\n")[0];
        const line = `${new Date().toISOString()} ${testInfo.project.use.baseURL ?? ""} "${testInfo.title}" ${url}: ${reason}`;
        testInfo.annotations.push({ type: "goto-retry", description: `${url}: ${reason}` });
        console.log(`[goto-retry] ${line}`);
        try {
          appendFileSync(GOTO_RETRY_LOG, `${line}\n`);
        } catch {
          // The log is a record only; it must not change the test's outcome.
        }
        // A reset connection leaves Chrome on its own error page, which would interrupt the
        // retry; leave it first.
        await goto("about:blank").catch(() => undefined);
        response = await goto(url, { timeout: RETRY_LOAD_TIMEOUT_MS, ...options, waitUntil: "domcontentloaded" });
      }
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => undefined);
      return response;
    };

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
      // The event is sent from the test runner, not the page. Sent from the
      // page, the fixture waited for *any* PostHog response and the browser
      // could close before this event left it: 1 in 10 completion events
      // (4 in 10 on longer journeys) never reached PostHog. The build identity
      // above is still read from, and checked in, the browser.
      const posthogClient = await page.evaluate(() => {
        const client = window.posthog;
        if (!client || typeof client.get_distinct_id !== "function") return null;
        return {
          token: client.config?.token as string | undefined,
          apiHost: client.config?.api_host as string | undefined,
          distinctId: client.get_distinct_id(),
        };
      });
      if (!posthogClient?.token || !posthogClient.apiHost) {
        throw new Error("PostHog is not initialized; cannot emit preview completion evidence.");
      }
      const response = await page.request.post(
        `${posthogClient.apiHost.replace(/\/$/, "")}/i/v0/e/`,
        {
          data: {
            api_key: posthogClient.token,
            event: "aceso_preview_journey_completed",
            distinct_id: posthogClient.distinctId,
            timestamp: new Date().toISOString(),
            properties: {
              ...context,
              aceso_deployment_id: context.deploymentId,
              aceso_release: context.release,
              aceso_environment: context.environment,
              aceso_preview_run_id: runId,
              synthetic: true,
            },
          },
          timeout: 15000,
        }
      );
      if (!response.ok()) {
        throw new Error(`PostHog rejected the preview completion event (${response.status()}).`);
      }
    }
  },
});

export { expect };
