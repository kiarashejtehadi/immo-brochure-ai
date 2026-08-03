/** Fetch with an abort timeout so PDF prep cannot hang indefinitely. */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 10_000, ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...fetchInit, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
