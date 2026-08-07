import { cancelAllActiveSubscriptions } from "@/lib/billing/cancel-subscription";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { DbSubscription } from "@/types/billing";

const BRAND_STORAGE_BUCKETS = ["brand-logos"] as const;

async function listStorageObjectPaths(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 200 });
  if (error || !data?.length) return [];

  const paths: string[] = [];
  for (const item of data) {
    if (!item.name) continue;
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      const nested = await listStorageObjectPaths(supabase, bucket, path);
      paths.push(...nested);
    } else {
      paths.push(path);
    }
  }
  return paths;
}

export async function deleteUserBrandStorage(userId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();

  for (const bucket of BRAND_STORAGE_BUCKETS) {
    const paths = await listStorageObjectPaths(supabase, bucket, userId);
    if (paths.length === 0) continue;

    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.warn("[delete-account] storage cleanup failed", bucket, error.message);
    }
  }
}

export async function deleteUserAccountData(params: {
  userId: string;
  subscriptions: DbSubscription[];
}): Promise<void> {
  await cancelAllActiveSubscriptions(params.subscriptions);
  await deleteUserBrandStorage(params.userId);

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(params.userId);
  if (error) {
    throw new Error(error.message);
  }
}
