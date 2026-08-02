"use client";

import { VoiceFillGlobalMount, VoiceFillProvider } from "@/components/listing/voice-fill-context";

/** Wraps locale layout with a single global voice-fill mount point. */
export function VoiceFillShell({ children }: { children: React.ReactNode }) {
  return (
    <VoiceFillProvider>
      {children}
      <VoiceFillGlobalMount />
    </VoiceFillProvider>
  );
}
