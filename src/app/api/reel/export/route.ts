import { NextResponse } from "next/server";
import { assertReelExportAccess } from "@/lib/billing/access";

export const runtime = "nodejs";

/**
 * Authorizes property reel export/render for signed-in users with billing access.
 * Pro (Monthly/Yearly) subscribers export without the demo watermark.
 */
export async function POST() {
  const access = await assertReelExportAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status },
    );
  }

  return NextResponse.json({ ok: true, isProReel: access.isProReel });
}
