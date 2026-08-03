const RELOAD_FLAG = "immo:chunk-reload-attempted";

export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const normalized = message.toLowerCase();
  return (
    (error instanceof Error && error.name === "ChunkLoadError") ||
    normalized.includes("loading chunk") ||
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("dynamically imported module")
  );
}

/** Hard reload with cache-bust — recovers stale chunk URLs after a deployment. */
export function reloadForStaleChunks(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(RELOAD_FLAG)) return;

  sessionStorage.setItem(RELOAD_FLAG, "1");
  const url = new URL(window.location.href);
  url.searchParams.set("_refresh", String(Date.now()));
  window.location.replace(url.toString());
}

/**
 * Retry a dynamic import; reload the page once if chunks are missing (post-deploy skew).
 */
export async function importWithChunkRetry<T>(
  loader: () => Promise<T>,
  retries = 1,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (!isChunkLoadError(error)) throw error;
    if (retries <= 0) {
      reloadForStaleChunks();
      return new Promise(() => {
        /* page is reloading */
      });
    }
    return importWithChunkRetry(loader, retries - 1);
  }
}

export function clearChunkReloadFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RELOAD_FLAG);
}

export function stripChunkRefreshParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("_refresh")) return;
  url.searchParams.delete("_refresh");
  window.history.replaceState(null, "", url.toString());
}
