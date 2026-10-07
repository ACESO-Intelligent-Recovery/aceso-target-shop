import { describe, expect, it } from "vitest";
import { captureOptions } from "@/lib/telemetry";

describe("captureOptions", () => {
  it("sends checkout_completed as a beacon so the page change cannot drop it", () => {
    expect(captureOptions("checkout_completed")).toEqual({
      send_instantly: true,
      transport: "sendBeacon",
    });
  });

  it("keeps the normal transport for events on a page that stays", () => {
    expect(captureOptions("add_to_cart")).toEqual({ send_instantly: true });
    expect(captureOptions("search_performed")).toEqual({ send_instantly: true });
  });
});
