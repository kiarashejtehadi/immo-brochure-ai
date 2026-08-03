"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "immo:chunk-reload-attempted";

function isChunkLoadError(error: unknown): boolean {
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
    normalized.includes("importing a module script failed")
  );
}

/** Reload once when a stale deployment chunk fails to load (common after Vercel deploys). */
export function ChunkLoadRecovery() {
  useEffect(() => {
    sessionStorage.removeItem(RELOAD_FLAG);

    function tryReload(error: unknown) {
      if (!isChunkLoadError(error)) return;
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }

    function onError(event: ErrorEvent) {
      tryReload(event.error ?? event.message);
    }

    function onRejection(event: PromiseRejectionEvent) {
      tryReload(event.reason);
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
