import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  // Controlled error route for Phase 1 Human Checkpoint HC-1.2
  // Triggered to verify Sentry issue creation and Vercel release string match
  const error = new Error("sentry-smoke: controlled test exception for AcesoLoop HC-1.2 verification");
  const eventId = Sentry.captureException(error);
  await Sentry.flush(2000);

  return NextResponse.json(
    {
      status: "error_triggered",
      eventId,
      message: error.message,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    },
    { status: 500 }
  );
}

