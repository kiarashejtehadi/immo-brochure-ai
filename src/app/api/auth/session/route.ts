import { type NextRequest } from "next/server";
import { refreshSupabaseAuthSession } from "@/lib/supabase/route-handler";

/** Silently refresh tokens and return the signed-in email (persistent HttpOnly cookies). */
export async function GET(request: NextRequest) {
  return refreshSupabaseAuthSession(request);
}

export async function POST(request: NextRequest) {
  return refreshSupabaseAuthSession(request);
}
