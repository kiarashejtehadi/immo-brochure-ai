import { NextResponse } from "next/server";
import { getBillingStatusForClient } from "@/lib/billing/access";

export const runtime = "nodejs";

export async function GET() {
  const status = await getBillingStatusForClient();
  return NextResponse.json(status);
}
