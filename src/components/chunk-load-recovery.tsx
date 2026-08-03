"use client";

import { useEffect } from "react";
import {
  clearChunkReloadFlag,
  isChunkLoadError,
  reloadForStaleChunks,
  stripChunkRefreshParam,
} from "@/lib/import-with-chunk-retry";

/** Reload once when a stale deployment chunk fails to load (common after Vercel deploys). */
export function ChunkLoadRecovery() {
  useEffect(() => {
    stripChunkRefreshParam();

    function tryRecover(error: unknown) {
      if (!isChunkLoadError(error)) return;
      reloadForStaleChunks();
    }

    function onError(event: ErrorEvent) {
      const target = event.target;
      if (target instanceof HTMLScriptElement && target.src.includes("/_next/static/chunks/")) {
        tryRecover(event.error ?? event.message ?? "loading chunk failed");
        return;
      }
      tryRecover(event.error ?? event.message);
    }

    function onRejection(event: PromiseRejectionEvent) {
      tryRecover(event.reason);
    }

    function onLoad() {
      clearChunkReloadFlag();
    }

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
