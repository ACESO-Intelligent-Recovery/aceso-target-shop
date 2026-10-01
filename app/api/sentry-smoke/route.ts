import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const error = new Error("sentry-smoke: controlled test exception for AcesoLoop HC-1.2 verification");
  const eventId = Sentry.captureException(error);
  
  let flushStatus = "success";
  try {
    const flushed = await Sentry.flush(2000);
    flushStatus = flushed ? "success" : "timeout";
  } catch (e: unknown) {
    flushStatus = "failed: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json(
    {
      status: "error_triggered",
      eventId,
      message: error.message,
      flushStatus,
      dsn_present: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      release: process.env.NEXT_PUBLIC_ACESO_RELEASE_ID || process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
      deploymentId: process.env.NEXT_PUBLIC_ACESO_DEPLOYMENT_ID || process.env.VERCEL_DEPLOYMENT_ID || "local-dev",
      environment: process.env.NEXT_PUBLIC_ACESO_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    },
    { status: 200 }
  );
}

