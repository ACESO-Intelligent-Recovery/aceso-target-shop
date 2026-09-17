import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const error = new Error("sentry-smoke: controlled test exception for AcesoLoop HC-1.2 verification");
  const eventId = Sentry.captureException(error);
  
  let flushStatus = "success";
  try {
    await Sentry.flush(2000);
  } catch (e: any) {
    flushStatus = "failed: " + e.message;
  }

  return NextResponse.json(
    {
      status: "error_triggered",
      eventId,
      message: error.message,
      flushStatus,
      dsn_present: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    },
    { status: 200 }
  );
}

