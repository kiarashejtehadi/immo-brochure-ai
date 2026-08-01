import { NextResponse } from "next/server";
import { assertProReelAccess } from "@/lib/billing/access";

export const runtime = "nodejs";

/**
 * Authorizes property reel export/render for Monthly & Yearly Pro subscribers.
 * Client-side Remotion rendering must call this before starting export.
 */
export async function POST() {
  const access = await assertProReelAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status },
    );
  }

  return NextResponse.json({ ok: true });
}
