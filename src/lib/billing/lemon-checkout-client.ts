const LEMON_JS_SRC = "https://assets.lemonsqueezy.com/lemon.js";

let lemonScriptPromise: Promise<void> | null = null;

function loadLemonJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.LemonSqueezy?.Url?.Open) return Promise.resolve();

  lemonScriptPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LEMON_JS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Lemon Squeezy.")));
      return;
    }

    const script = document.createElement("script");
    script.src = LEMON_JS_SRC;
    script.async = true;
    script.onload = () => {
      window.createLemonSqueezy?.();
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Lemon Squeezy."));
    document.body.appendChild(script);
  });

  return lemonScriptPromise;
}

/** Opens Lemon Squeezy checkout overlay when available; falls back to full redirect. */
export async function openLemonSqueezyCheckout(url: string): Promise<void> {
  try {
    await loadLemonJs();
    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(url);
      return;
    }
  } catch {
    /* fall through to redirect */
  }
  window.location.href = url;
}
