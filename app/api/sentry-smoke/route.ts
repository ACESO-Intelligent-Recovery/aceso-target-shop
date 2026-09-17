import { NextResponse } from "next/server";

export async function GET() {
  // Controlled error route for Phase 1 Human Checkpoint HC-1.2
  // Triggered to verify Sentry issue creation and Vercel release string match
  throw new Error("sentry-smoke: controlled test exception for AcesoLoop HC-1.2 verification");
  
  return NextResponse.json({ status: "unexpected_success" });
}
