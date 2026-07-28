/** Parse JSON from a fetch Response without throwing on empty bodies. */
export async function readJsonResponse<T extends Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) {
    throw new Error(
      res.ok
        ? "Server returned an empty response."
        : `Request failed (${res.status}). Try again or contact support.`,
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `Invalid server response (${res.status}). ${raw.slice(0, 120)}`,
    );
  }
}
