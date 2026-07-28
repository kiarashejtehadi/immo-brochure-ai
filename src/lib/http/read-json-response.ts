/** Parse JSON from a fetch Response without throwing raw JSON.parse errors. */
export async function readJsonResponse<T extends Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const raw = await res.text();
  const statusHint = res.status ? ` (HTTP ${res.status})` : "";

  if (!raw.trim()) {
    throw new Error(
      res.ok
        ? `Server returned an empty response${statusHint}.`
        : `Checkout request failed${statusHint}. Redeploy the latest build, then try again.`,
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const preview = raw.replace(/\s+/g, " ").slice(0, 160);
    throw new Error(
      preview.startsWith("<!")
        ? `Checkout request failed${statusHint} (server returned HTML, not JSON).`
        : `Checkout request failed${statusHint}: ${preview}`,
    );
  }
}
