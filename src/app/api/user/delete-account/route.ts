import { type NextRequest, NextResponse } from "next/server";
import { deleteUserAccountData } from "@/lib/account/delete-user-account";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { DbSubscription } from "@/types/billing";

async function getUserSubscriptions(userId: string): Promise<DbSubscription[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data as DbSubscription[]) ?? [];
}

export async function POST(request: NextRequest) {
  const authUser = await getSupabaseAuthUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const routeSupabase = createSupabaseRouteHandlerClient(request, response);

  try {
    const subscriptions = await getUserSubscriptions(authUser.id);
    await deleteUserAccountData({
      userId: authUser.id,
      subscriptions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Account deletion failed.";
    console.error("[delete-account]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await routeSupabase.auth.signOut();
  return response;
}
