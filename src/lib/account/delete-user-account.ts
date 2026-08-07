import { cancelAllActiveSubscriptions } from "@/lib/billing/cancel-subscription";
import { removeAllUserStorageFiles } from "@/lib/account/user-storage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { DbSubscription } from "@/types/billing";

export async function deleteUserAccountData(params: {
  userId: string;
  subscriptions: DbSubscription[];
}): Promise<void> {
  await cancelAllActiveSubscriptions(params.subscriptions);
  await removeAllUserStorageFiles(params.userId);

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(params.userId);
  if (error) {
    throw new Error(error.message);
  }
}
