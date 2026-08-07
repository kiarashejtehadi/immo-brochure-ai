import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const BRAND_STORAGE_BUCKETS = ["brand-logos"] as const;

export type UserStorageFileEntry = {
  bucket: string;
  path: string;
  file_name: string;
  public_url: string | null;
  updated_at: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
};

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

export async function listUserStorageFiles(userId: string): Promise<UserStorageFileEntry[]> {
  const supabase = createSupabaseServiceClient();
  const entries: UserStorageFileEntry[] = [];

  for (const bucket of BRAND_STORAGE_BUCKETS) {
    const paths = await listUserStorageObjectPaths(userId, bucket);
    for (const path of paths) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      entries.push({
        bucket,
        path,
        file_name: path.split("/").pop() ?? path,
        public_url: publicUrlData.publicUrl ?? null,
        updated_at: null,
        created_at: null,
        metadata: null,
      });
    }
  }

  return entries;
}

export async function listUserStorageObjectPaths(
  userId: string,
  bucket: (typeof BRAND_STORAGE_BUCKETS)[number],
): Promise<string[]> {
  const supabase = createSupabaseServiceClient();
  return listStorageObjectPaths(supabase, bucket, userId);
}

export async function removeAllUserStorageFiles(userId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();

  for (const bucket of BRAND_STORAGE_BUCKETS) {
    const paths = await listUserStorageObjectPaths(userId, bucket);
    if (paths.length === 0) continue;

    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.warn("[delete-account] storage cleanup failed", bucket, error.message);
    }
  }
}
